export class NotImplementedError extends Error {
  static readonly ERROR_NAME = 'NOT_IMPLEMENTED';
  constructor(message: string) {
    super(message);
    this.name = NotImplementedError.ERROR_NAME;
  }
}
