/// <reference types="jest" />

import { ValidationError } from '../errors';
import { insertAt, moveWithin } from '../reorder';

describe('reorder helpers', () => {
  it('inserts at a clamped position without mutating the source', () => {
    const source = ['a', 'c'];
    expect(insertAt(source, 'b', 1)).toEqual(['a', 'b', 'c']);
    expect(insertAt(source, 'z', 99)).toEqual(['a', 'c', 'z']);
    expect(source).toEqual(['a', 'c']);
  });

  it('moves within a list and clamps the destination', () => {
    expect(moveWithin(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
    expect(moveWithin(['a', 'b', 'c'], 2, -1)).toEqual(['c', 'a', 'b']);
  });

  it('rejects invalid indexes', () => {
    expect(() => moveWithin(['a'], -1, 0)).toThrow(ValidationError);
    expect(() => insertAt(['a'], 'b', 0.5)).toThrow(ValidationError);
  });
});
