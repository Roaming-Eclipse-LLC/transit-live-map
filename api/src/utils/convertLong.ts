type LongLike = {
  low: number;
  toNumber: () => number;
};

const isLongLike = (value: unknown): value is LongLike => {
  return typeof value === 'object' && value !== null && 'toNumber' in value;
};

export const convertLong = (value: unknown): number => {
  if (!value) {
    return Date.now();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (isLongLike(value)) {
    return value.toNumber();
  }

  return Date.now();
};
