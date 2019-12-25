import { observable } from 'mobx';
import { sha1Hash } from '../utils/hashUtils';

export interface ITrackProgress {
  trackId: string;
  currentTime: number;
  uri: string;
  checksum: string;
}

export class TrackProgress implements ITrackProgress {
  @observable currentTime: number = null;
  @observable trackId: string = null;
  @observable uri: string = null;
  @observable checksum: string = null;

  // Factory
  static async make(uri: string): Promise<TrackProgress> {
    const checksum = await TrackProgress.calcChecksum(uri);
    const trackId = await TrackProgress.calcTrackId(uri, checksum);
    return new TrackProgress({uri, checksum, trackId, currentTime: 0});
  }

  constructor(data: ITrackProgress) {
    this.currentTime = data.currentTime;
    this.trackId = data.trackId;
    this.uri = data.uri;
    this.checksum = data.checksum;
  }

  toJSON(): ITrackProgress {
    return {
      trackId: this.trackId,
      currentTime: this.currentTime,
      uri: this.uri,
      checksum: this.checksum
    };
  }

  static fromJSON(data: ITrackProgress): TrackProgress {
    return new TrackProgress(data);
  }

  static async calcChecksum(uri: string): Promise<string> {
    return uri;
    // const statResult = await stat(uri);
    // const checksum = await hash(statResult.originalFilepath, 'sha1');
    // const trackData: string = await readFile(uri);
    // const checksum = await sha1Hash(trackData);
    // return checksum;
  }

  static async calcTrackId(uri: string, checksum: string): Promise<string> {
    const data = `${uri}-${checksum}`;
    return await sha1Hash(data);
  }

  static async getTrackIdForURI(uri: string): Promise<string> {
    const checksum = await TrackProgress.calcChecksum(uri);
    return TrackProgress.calcTrackId(uri, checksum);
  }
}
