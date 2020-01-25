import { observable } from 'mobx';
import { hash } from 'react-native-fs';

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
    return await hash(uri, 'md5');
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
