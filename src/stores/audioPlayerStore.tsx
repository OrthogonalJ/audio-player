import { observable, action, runInAction, IObservableValue, computed } from 'mobx';
import { Player } from '@react-native-community/audio-toolkit';
import { exists } from 'react-native-fs';

import { PLAYER_STATES } from '../models/playerStates';
import { TrackProgress } from '../models/trackProgress';
import { IFile } from '../models/file';
import { TrackProgressService } from '../services/trackProgressService';
import { TrackHistoryService } from '../services/trackHistoryService';
import { getUriBaseName } from '../utils/fileUtils';
import { promisify } from '../utils/promiseUtils';
import { NoStoredDataError } from '../exceptions/noStoredDataError';
import { FileNotFoundError } from '../exceptions/fileNotFoundError';

export class AudioPlayerStore {
  @observable private _player: IObservableValue<Player> = observable.box(null);
  @observable private _trackProgress: IObservableValue<TrackProgress> = observable.box(null);
  @observable playerState: PLAYER_STATES = PLAYER_STATES.PAUSED;
  @observable title: string = '';
  @observable isLoaded: boolean = false;
  
  @action.bound
  async loadFile(file: IFile) {
    try {
      console.log(`[AudioPlayerStore$loadFile] audio player store loading file: ${JSON.stringify(file)}`);
      if (this.isLoaded) await this.reset();

      const player = new Player(file.uri, {
        continuesToPlayInBackground: true, 
        autoDestroy: false
      });
      player.on('ended', () => this.handleTrackEnded());
      await promisify(player.prepare, player);
      
      const trackProgress = await TrackProgressService.getOrCreateTrackProgress(file.uri);

      runInAction(() => {
        this._player.set(player);
        this.title = file.name;
        this.playerState = PLAYER_STATES.PAUSED;
        this._trackProgress.set(trackProgress);
        this.isLoaded = true;
      });

      await this.seek(this.trackProgress.currentTime);
      await TrackHistoryService.setLastTrack(this.trackProgress.uri);
    } catch (error) {
      if (error.err && error.err === 'invalidpath') {
        throw new FileNotFoundError(file.uri);
      }
      throw error;
    }
  }

  @computed
  get player(): Player {
    return this._player.get(); 
  }

  @computed
  get trackProgress(): TrackProgress {
    return this._trackProgress.get();
  }

  @action.bound
  async playPause() {
    if (!this.isLoaded) return;

    await promisify(this.player.playPause, this.player);
    
    // Using this is as a natural opportunity to save the track progress
    await this.saveProgress();

    runInAction(() => {
      this.playerState = this.player.isPlaying ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED
    });
  }

  @action.bound
  async saveProgress() {
    this.trackProgress.currentTime = this.player.currentTime;
    await TrackProgressService.saveTrackProgress(this.trackProgress);
  }

  @action.bound
  async seek(milliseconds: number) {
    if (!this.isLoaded) return;

    await new Promise((resolve, reject) => {
      this.player.seek(milliseconds, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    this.saveProgress();
  }

  @action.bound
  async relativeSeek(millisecondsDelta: number) {
    if (!this.isLoaded) return;

    await new Promise((resolve, reject) => {
      let newTime = this.player.currentTime + millisecondsDelta;
      newTime = Math.max(0, newTime);
      newTime = Math.min(newTime, Math.max(0, this.player.duration));
      this.player.seek(newTime, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  @action.bound
  async reset() {
    if (this.isLoaded && this.player !== null) {
      await promisify(this.player.stop, this.player);
      runInAction(() => {
        this.isLoaded = false;
        this._player.set(null);
        this.playerState = PLAYER_STATES.PAUSED;
        this._trackProgress.set(null);
      });
    }
  }

  @action.bound
  async loadLastOpennedTrack() {
    const uri = await TrackHistoryService.getLastTrack();
    const fileName = getUriBaseName(uri);
    await this.loadFile({uri, name: fileName});
  }

  @action.bound
  private async handleTrackEnded() {
    await this.seek(0);
    runInAction(() => {
      this.playerState = PLAYER_STATES.PAUSED;
    });
  }
}