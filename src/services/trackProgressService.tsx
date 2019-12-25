import { TrackProgress, ITrackProgress } from '../models/trackProgress';
import { StorageService } from './storageService';

export class TrackProgressService {
  private static readonly COLLECTION = 'TRACK_PROGRESS';

  static async getOrCreateTrackProgress(uri: string): Promise<TrackProgress> {
    const trackId = await TrackProgress.getTrackIdForURI(uri);
    console.log(`[TrackProgressService$getOrCreateTrackProgress] Getting or creating track progress record for ${JSON.stringify({uri, trackId})}`);

    let trackProgress: TrackProgress;
    if (await StorageService.exists(TrackProgressService.COLLECTION, trackId)) {
      const trackProgressJSON: ITrackProgress = await StorageService.getItem(TrackProgressService.COLLECTION, trackId);
      trackProgress = TrackProgress.fromJSON(trackProgressJSON);
      console.log(`[TrackProgressService$getOrCreateTrackProgress] Found existing track progress record: ${JSON.stringify(trackProgress)}`);
    } else {
      trackProgress = await TrackProgress.make(uri);
      console.log(`[TrackProgressService$getOrCreateTrackProgress] Made new track progress record: ${JSON.stringify(trackProgress)}`);
    }
    
    return trackProgress;
  }

  static async saveTrackProgress(trackProgress: TrackProgress) {
    console.log(`[TrackProgressService$saveTrackProgress] Saving progress for track: ${trackProgress.trackId} (${JSON.stringify(trackProgress)})`);
    await StorageService.setItem(TrackProgressService.COLLECTION, trackProgress.trackId, trackProgress);
  }
}