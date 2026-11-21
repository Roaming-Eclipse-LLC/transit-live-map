import { afterEach, describe, expect, it, vi } from 'vitest';

import { createArrowImage } from './arrowImage';

const makeContext = () => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ width: 40, height: 40 }),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
});

// jsdom has no canvas implementation, so getContext('2d') returns null
// unless we stub it.
const stubContext = (ctx: ReturnType<typeof makeContext> | null) =>
  vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);

describe('createArrowImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws a closed arrow shape and returns the image data', () => {
    const ctx = makeContext();
    stubContext(ctx);

    const image = createArrowImage(40);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(image).toBe(ctx.getImageData.mock.results[0].value);
  });

  it('uses the teal fill and black stroke by default', () => {
    const ctx = makeContext();
    stubContext(ctx);

    createArrowImage();

    expect(ctx.fillStyle).toBe('#0aacbb');
    expect(ctx.strokeStyle).toBe('#000000');
  });

  it('uses custom colors when given', () => {
    const ctx = makeContext();
    stubContext(ctx);

    createArrowImage(52, '#ff4757', '#ffffff');

    expect(ctx.fillStyle).toBe('#ff4757');
    expect(ctx.strokeStyle).toBe('#ffffff');
  });

  it('reads back an image the size that was requested', () => {
    const ctx = makeContext();
    stubContext(ctx);

    createArrowImage(52);

    expect(ctx.getImageData).toHaveBeenCalledWith(0, 0, 52, 52);
  });

  it('throws when the canvas context is unavailable', () => {
    stubContext(null);

    expect(() => createArrowImage()).toThrow('Could not get canvas context');
  });
});
