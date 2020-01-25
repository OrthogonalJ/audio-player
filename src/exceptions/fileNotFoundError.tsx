export class FileNotFoundError extends Error {
  static readonly ERROR_NAME = 'FILE_NOT_FOUND';
  constructor(message: string) {
    super(message);
    this.name = FileNotFoundError.ERROR_NAME;
  }
}