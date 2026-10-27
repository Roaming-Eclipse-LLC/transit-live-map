import { describe, expect, it, vi } from 'vitest';

import { rateLimiter } from './rateLimiter';

const mockRes = () => {
  const res = {
    setHeader: vi.fn(),
    getHeader: vi.fn().mockReturnValue(undefined),
    removeHeader: vi.fn(),
    end: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
    write: vi.fn(),
    writableEnded: false as boolean,
    headersSent: false as boolean,
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);

  return res;
};

describe('rateLimiter', () => {
  it('is a function (valid Express middleware)', () => {
    expect(typeof rateLimiter).toBe('function');
  });

  it('calls next() on a normal request', async () => {
    const req = {
      ip: '127.0.0.1',
      headers: {},
      method: 'GET',
      url: '/health',
      app: {
        get: vi.fn().mockReturnValue(false),
      },
    } as unknown as Parameters<typeof rateLimiter>[0];

    const res = mockRes();
    const next = vi.fn();

    await rateLimiter(
      req,
      res as unknown as Parameters<typeof rateLimiter>[1],
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  it('blocks requests after exceeding the limit', async () => {
    const req = {
      ip: '192.168.1.100',
      headers: {},
      method: 'GET',
      url: '/',
      app: {
        get: vi.fn().mockReturnValue(false),
      },
    } as unknown as Parameters<typeof rateLimiter>[0];

    const next = vi.fn();

    for (let i = 0; i < 25; i++) {
      await rateLimiter(
        req,
        mockRes() as unknown as Parameters<typeof rateLimiter>[1],
        next,
      );
    }

    next.mockClear();
    await rateLimiter(
      req,
      mockRes() as unknown as Parameters<typeof rateLimiter>[1],
      next,
    );

    expect(next).not.toHaveBeenCalled();
  });
});
