import { useEffect, useLayoutEffect } from 'react';
import MusicControl from 'react-native-music-control';

import { PLAYER_STATES } from '../models/playerStates';

export interface MusicControlState {
  currentTime: number;
  playerState: PLAYER_STATES;
  title: string;
  duration: number;
  readyToUpdate: boolean;
}

export interface MusicControlOptions {
  onPlayPause: () => void;
  onRelativeSeek: (delta: number) => void;
  relativeSeekDelta: number;
}

export function useMediaControlNotification(state: MusicControlState, options: MusicControlOptions) {
  useInitNotification(options);
  useUpdateNotification(state);
}

/**
 * Initialise the a media control notification when the component is mounted.
 * @param onPlayPause Event handler for the play and pause button press events 
 */
function useInitNotification(options: MusicControlOptions) {
  const {relativeSeekDelta, onPlayPause, onRelativeSeek} = options;
  useEffect(() => {
    MusicControl.enableBackgroundMode(true);

    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('skipForward', true, {interval: relativeSeekDelta});
    MusicControl.enableControl('skipBackward', true, {interval: relativeSeekDelta});

    MusicControl.on('play', () => {
      onPlayPause();
    });

    MusicControl.on('pause', () => {
      onPlayPause();
    });

    MusicControl.on('skipForward', () => {
      onRelativeSeek(relativeSeekDelta);
    });

    MusicControl.on('skipBackward', () => {
      onRelativeSeek(-relativeSeekDelta);
    });
  }, [onPlayPause, onRelativeSeek, relativeSeekDelta]);
}

function useUpdateNotification(state: MusicControlState) {
  const {title, duration, readyToUpdate, currentTime, playerState} = state;
  useLayoutEffect(() => {
    if (readyToUpdate) {
      MusicControl.setNowPlaying({
        title: title,
        duration: duration
      });
      
      MusicControl.updatePlayback({
        state: musicControlStateConstant(playerState),
        elapsedTime: currentTime,
        speed: 1
      });
    }
  }, [currentTime, duration, readyToUpdate, currentTime, playerState]);
}

/**
 * Maps PLAYER_STATES enum values to STATE_* constants used by react-native-music-control
 */
function musicControlStateConstant(playerState: PLAYER_STATES): any {
  return (playerState == PLAYER_STATES.PLAYING) ? 
      MusicControl.STATE_PLAYING : MusicControl.STATE_PAUSED;
}