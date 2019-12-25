export class KeyError extends Error {
  static readonly ERROR_NAME = 'KEY_ERROR';
  constructor(message: string) {
    super(message);
    this.name = KeyError.ERROR_NAME;
  }
}