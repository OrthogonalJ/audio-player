import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { observer, useLocalStore } from 'mobx-react';
import DocumentPicker from 'react-native-document-picker';
import { stat } from 'react-native-fs';
// import MusicControl from 'react-native-music-control';

import TimeSeekerInput from './TimeSeekerInput';
import StoresContext from '../contexts/storesContext';
import { useMediaControlNotification as _useMediaControlNotification } from '../hooks/mediaControlNotificationHooks';
import { PLAYER_STATES } from '../models/playerStates';
import { AudioPlayerStore } from '../stores/audioPlayerStore';

// All units in milliseconds
const RELATIVE_SEEK_DELTA = 10000;
const REPEAT_RELATIVE_SEEK_FREQ = 100;
const UPDATE_TIME_FREQ = 100;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 10
  },
  controlGroupContainer: {
    width: '100%',
    height: '100%', 
    minHeight: 61,
    padding: 0, 
    alignItems: 'center',
    flex: 2,
    justifyContent: 'space-evenly',
    flexDirection: 'row'
  },
  controlContainer : {
    height: 60,
    width: 60,
    backgroundColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30
  },
  seekerContainer: {
    flex: 2,
    flexDirection: 'column',
    width: '100%',
    borderColor: 'black',
    borderTopWidth: 1,
    minHeight: 30
  },
  seeker: {
    width: '100%',
    textAlign: 'center'
  }
});

interface AudioPlayerState {
  currentTime: number;
  isSeeking: boolean;
  updateLoopDirty: boolean;
  timeUpdateIntervalId: number;
  setCurrentTime(currentTime: number): void;
  setIsSeeking(value: boolean): void;
  setUpdateLoopDirty(value: boolean): void;
}

function AudioPlayer() {
  const playerStore: AudioPlayerStore = useContext(StoresContext).audioPlayer;
  const state = useLocalStore<AudioPlayerState>(() => ({
    currentTime: 0,
    isSeeking: false,
    updateLoopDirty: false,
    timeUpdateIntervalId: null,
    setCurrentTime(currentTime: number) { state.currentTime = currentTime; },
    setIsSeeking(value: boolean) { state.isSeeking = value; },
    setUpdateLoopDirty(value: boolean) { state.updateLoopDirty = value; }
  }));

  //// EVENT HANDLERS ////

  const onPickFileBtnClicked = async () => {
    await selectFile(state, playerStore);
  };

  const onPlayPauseBtnClicked = useCallback(async () => { 
    await playerStore.playPause();
  }, []);

  const onSeekerValueChange = async (milliseconds: number) => {
    const shouldChangeSeekingFlag = !state.isSeeking;
    if (shouldChangeSeekingFlag) state.setIsSeeking(true);
    await playerStore.seek(milliseconds);
    updateCurrentTime(state, playerStore);
    if (shouldChangeSeekingFlag) state.setIsSeeking(false);
  };

  const onSeekerSlidingStart = (milliseconds: number) => state.setIsSeeking(true);

  const onSeekerSlidingComplete = (milliseconds: number) => state.setIsSeeking(false);

  const onRelativeSeek = useCallback(async (millisecondDelta: number) => {
    await playerStore.relativeSeek(millisecondDelta);
  }, []);

  //// SETUP EFFECTS ////

  useUpdateTime(state, playerStore);
  useMediaControlNotification(state, playerStore, onPlayPauseBtnClicked, onRelativeSeek);

  // useInitMediaNotificationEffect(onPlayPauseBtnClicked, onRelativeSeek);

  //// RENDERING ////

  // updateMediaNotification(state, playerStore);

  const trackLength = (playerStore.isLoaded) ? playerStore.player.duration : 0;
  const playPauseBtnIconName = (playerStore.isLoaded && playerStore.playerState === PLAYER_STATES.PLAYING) ? 'pause' : 'play';
  const title = (playerStore.isLoaded) ? playerStore.title : 'Select a track';
  return (
    <View style={styles.mainContainer}>
      <View style={styles.title}>
        <Text onPress={onPickFileBtnClicked}>{title}</Text>
      </View>
      <View style={styles.controlGroupContainer}>
        <RelativeSeekButton 
          millisecondDelta={-RELATIVE_SEEK_DELTA}
          onClick={onRelativeSeek}
          iconName='rewind' 
          iconType='foundation'
        />
        <TouchableOpacity style={styles.controlContainer} onPress={onPlayPauseBtnClicked}>
          <Icon name={playPauseBtnIconName} type='foundation'/>
        </TouchableOpacity>
        <RelativeSeekButton 
          millisecondDelta={RELATIVE_SEEK_DELTA}
          onClick={onRelativeSeek}
          iconName='fast-forward'
          iconType='foundation'
        /> 
      </View>
      <View style={styles.seekerContainer}>
        <TimeSeekerInput 
          disabled={!playerStore.isLoaded} 
          maxMilliseconds={trackLength}
          value={state.currentTime}
          onValueChange={onSeekerValueChange}
          onSlidingStart={onSeekerSlidingStart}
          onSlidingComplete={onSeekerSlidingComplete}
        />
      </View>
    </View>
  );
}

//// HELPER COMPONENTS ////

/**
 * Button for skipping time forward/back (aka a relative seek)
 * Calls onClick every REPEAT_RELATIVE_SEEK_FREQ milliseconds when held
 */
const RelativeSeekButton = observer(function RelativeSeekButton(
      props: {millisecondDelta: number, iconName: string, iconType: string, 
              onClick: (delta: number) => void}) {
  const [repeatClickIntervalId, setRepeatClickIntervalId] = useState<number>(null);
  return (
    <TouchableOpacity 
        style={styles.controlContainer} 
        onPress={() => props.onClick(props.millisecondDelta)}
        onPressIn={() => {
          const intervalId = setInterval(() => { 
            props.onClick(props.millisecondDelta) 
          }, REPEAT_RELATIVE_SEEK_FREQ);
          setRepeatClickIntervalId(intervalId);
        }}
        onPressOut={() => clearInterval(repeatClickIntervalId)}>
      <Icon name={props.iconName} type={props.iconType}/>
    </TouchableOpacity>
  );
});

//// HELPERS ////

function useMediaControlNotification(state: AudioPlayerState, playerStore: AudioPlayerStore,
      onPlayPause: () => void, onRelativeSeek: (delta: number) => void) {
  const notificationState = {
    currentTime: state.currentTime,
    playerState: playerStore.playerState,
    title: playerStore.title,
    duration: playerStore.isLoaded ? playerStore.player.duration : 0,
    readyToUpdate: playerStore.isLoaded
  };
  const options = {
    onPlayPause,
    onRelativeSeek,
    relativeSeekDelta: RELATIVE_SEEK_DELTA
  };
  _useMediaControlNotification(notificationState, options);
}

/**
 * Maps PLAYER_STATES enum values to STATE_* constants used by react-native-music-control
 */
// function musicControlStateConstant(playerState: PLAYER_STATES): any {
//   return (playerState == PLAYER_STATES.PLAYING) ? 
//       MusicControl.STATE_PLAYING : MusicControl.STATE_PAUSED;
// }

// function updateMediaNotification(state: AudioPlayerState, playerStore: AudioPlayerStore) {
//   if (playerStore.isLoaded) {
//     MusicControl.setNowPlaying({
//       title: playerStore.title,
//       duration: playerStore.player.duration
//     });
    
//     MusicControl.updatePlayback({
//       state: musicControlStateConstant(playerStore.playerState),
//       elapsedTime: state.currentTime,
//       speed: 1
//     });
//   }
// }

function updateCurrentTime(state: AudioPlayerState, playerStore: AudioPlayerStore) {
  state.setCurrentTime(playerStore.player.currentTime);
}

/**
 * Prompt user for audio file (using system's file dialog) and load the file for playback
 */
async function selectFile(state: AudioPlayerState, playerStore: AudioPlayerStore) {
  try {
    const selectedFile = await DocumentPicker.pick({
      type: [DocumentPicker.types.audio]
    });
    const fileStats = await stat(selectedFile.uri);
    await playerStore.loadFile({uri: fileStats.originalFilepath, name: selectedFile.name});
    updateCurrentTime(state, playerStore);
  } catch (error) {
    if (!DocumentPicker.isCancel(error)) {
      throw error;
    }
  }
}

/**
 * Polls for changes in playerStore's currentTime and updates components currentTime state
 */
function useUpdateTime(state: AudioPlayerState, playerStore: AudioPlayerStore) {
  const [intervalId, setIntervalId] = useState<number>(null);
  useEffect(() => {
    console.log('[AudioPlayer$useUpdateTimeEffect] Running...');
    // make sure we don't have multiple intervals running
    // if (intervalId !== null) clearInterval(intervalId);

    const _intervalId = setInterval(() => {
      if (state.updateLoopDirty) {
        state.setUpdateLoopDirty(false);
        return;
      }

      if (playerStore.player !== null && 
          playerStore.player.currentTime !== state.currentTime &&
          !state.isSeeking) {
        state.setCurrentTime(playerStore.player.currentTime);
      }
    }, UPDATE_TIME_FREQ);

    setIntervalId(_intervalId);

    return () => { clearInterval(intervalId) };
  }, []);
}

/**
 * Initialise the a media control notification when the component is mounted.
 * @param onPlayPause Event handler for the play and pause button press events 
 */
// function useInitMediaNotificationEffect(onPlayPause: () => void, 
//     onRelativeSeek: (delta: number) => void) {
  
//   useEffect(() => {
//     MusicControl.enableBackgroundMode(true);

//     MusicControl.enableControl('play', true);
//     MusicControl.enableControl('pause', true);
//     MusicControl.enableControl('skipForward', true, {interval: RELATIVE_SEEK_DELTA});
//     MusicControl.enableControl('skipBackward', true, {interval: RELATIVE_SEEK_DELTA});

//     MusicControl.on('play', () => {
//       onPlayPause();
//     });

//     MusicControl.on('pause', () => {
//       onPlayPause();
//     });

//     MusicControl.on('skipForward', () => {
//       onRelativeSeek(RELATIVE_SEEK_DELTA);
//     });

//     MusicControl.on('skipBackward', () => {
//       onRelativeSeek(-RELATIVE_SEEK_DELTA);
//     });
//   });
// }

export default observer(AudioPlayer);