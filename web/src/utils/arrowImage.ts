export const createArrowImage = (
  size: number = 40,
  fillColor: string = '#0aacbb',
  strokeColor: string = '#000000',
): ImageData => {
  const canvas = document.createElement('canvas');

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const half = size / 2;
  const tip = size * 0.15;
  const base = size * 0.85;
  const wingSpread = size * 0.3;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();

  ctx.moveTo(half, tip);
  ctx.lineTo(half + wingSpread, base);
  ctx.lineTo(half, base - size * 0.2);
  ctx.lineTo(half - wingSpread, base);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
};
