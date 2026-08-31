import { ValidationError } from './errors';

export function insertAt<T>(
  items: readonly T[],
  item: T,
  requestedIndex: number,
): T[] {
  if (!Number.isInteger(requestedIndex)) {
    throw new ValidationError('targetIndex must be an integer');
  }

  const index = Math.max(0, Math.min(requestedIndex, items.length));
  const result = [...items];
  result.splice(index, 0, item);
  return result;
}

export function moveWithin<T>(
  items: readonly T[],
  fromIndex: number,
  requestedIndex: number,
): T[] {
  if (!Number.isInteger(requestedIndex)) {
    throw new ValidationError('targetIndex must be an integer');
  }

  if (fromIndex < 0 || fromIndex >= items.length) {
    throw new ValidationError('fromIndex is outside the collection');
  }

  const result = [...items];
  const [item] = result.splice(fromIndex, 1);
  const index = Math.max(0, Math.min(requestedIndex, result.length));
  result.splice(index, 0, item);
  return result;
}
