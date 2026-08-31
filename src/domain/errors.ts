export class ValidationError extends Error {
  readonly name = 'ValidationError';
}

export class EntityNotFoundError extends Error {
  readonly name = 'EntityNotFoundError';

  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`);
  }
}
