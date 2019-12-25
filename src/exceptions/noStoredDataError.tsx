/**
 * Throw a NoStoredDataError to indicate some requested 
 * piece of data doesn't exist in persistent storage
 */
export class NoStoredDataError extends Error {
  static readonly ERROR_NAME = 'NO_STORED_DATA_ERROR';
  private static readonly DEFAULT_MESSAGE = 'NO_STORED_DATA_ERROR';

  constructor(message: string = NoStoredDataError.DEFAULT_MESSAGE) {
    super(message);
    this.name = NoStoredDataError.ERROR_NAME;
  }
}
