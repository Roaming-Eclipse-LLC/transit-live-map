import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './app';
import { startTestServer, type TestServer } from './test/startTestServer';

let testServer: TestServer;

beforeAll(async () => {
  testServer = await startTestServer(createApp());
});

afterAll(async () => {
  await testServer.close();
});

// The rate limiter keeps one in-memory counter per IP for the whole file,
// so each test sends its own client IP through X-Forwarded-For.
const get = (path: string, ip: string) =>
  fetch(`${testServer.httpUrl}${path}`, { headers: { 'X-Forwarded-For': ip } });

describe('routes', () => {
  it('GET / confirms the API is running', async () => {
    const res = await get('/', '203.0.113.1');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: 'Transit Live Map API is running',
    });
  });

  it('GET /health returns ok with an ISO timestamp', async () => {
    const res = await get('/health', '203.0.113.2');
    const body = (await res.json()) as { status: string; timestamp: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await get('/nope', '203.0.113.3');

    expect(res.status).toBe(404);
  });
});

describe('security headers', () => {
  it('sets Helmet headers and hides x-powered-by', async () => {
    const res = await get('/health', '203.0.113.4');

    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('strict-transport-security')).toBeTruthy();
    expect(res.headers.get('content-security-policy')).toBeTruthy();
    expect(res.headers.get('x-powered-by')).toBeNull();
  });
});

describe('rate limiting', () => {
  it('allows 25 requests, then answers 429', async () => {
    const ip = '203.0.113.5';

    for (let i = 0; i < 25; i++) {
      expect((await get('/health', ip)).status).toBe(200);
    }

    const blocked = await get('/health', ip);

    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      status: 429,
      message: 'Too many requests, please try again later.',
    });
  });

  it('counts each client IP separately behind the proxy', async () => {
    const noisy = '203.0.113.6';

    for (let i = 0; i < 26; i++) {
      await get('/health', noisy);
    }
    expect((await get('/health', noisy)).status).toBe(429);

    const other = await get('/health', '203.0.113.7');

    expect(other.status).toBe(200);
    expect(other.headers.get('ratelimit-remaining')).toBe('24');
  });
});
