import { StorageService } from './storageService';
import { KeyError } from '../exceptions/keyError';
import { NoStoredDataError } from '../exceptions/noStoredDataError';

export class TrackHistoryService {
  private static readonly COLLECTION = 'TRACK_HISTORY';
  private static readonly LAST_TRACK_KEY = 'LAST_TRACK';

  static async getLastTrack(): Promise<string> {
    try {
      return await StorageService.getItem(TrackHistoryService.COLLECTION, 
          TrackHistoryService.LAST_TRACK_KEY);
    } catch (error) {
      if (error instanceof KeyError) throw new NoStoredDataError('No last track in persistent storage');
      throw error;
    }
  }

  static async setLastTrack(uri: string) {
    await StorageService.setItem(TrackHistoryService.COLLECTION, 
        TrackHistoryService.LAST_TRACK_KEY, uri);
  }
}