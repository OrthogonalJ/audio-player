import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { observer, useLocalStore } from 'mobx-react';
import DocumentPicker from 'react-native-document-picker';
import { stat, DocumentDirectoryPath } from 'react-native-fs';

import TimeSeekerInput from '../TimeSeekerInput/TimeSeekerInput';
import MediaSelector from '../MediaSelector';
import StoresContext from '../../contexts/storesContext';
import { useMediaControlNotification as _useMediaControlNotification } from '../../hooks/mediaControlNotificationHooks';
import { PLAYER_STATES } from '../../models/playerStates';
import { AudioPlayerStore } from '../../stores/audioPlayerStore';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

import styles from './AudioPlayerStyles';

// All units in milliseconds
const RELATIVE_SEEK_DELTA = 10000;
const REPEAT_RELATIVE_SEEK_FREQ = 100;
const UPDATE_TIME_FREQ = 100;

interface AudioPlayerState {
  currentTime: number;
  isSeeking: boolean;
  isSelectFileModalVisible: boolean;
  setCurrentTime(currentTime: number): void;
  setIsSeeking(value: boolean): void;
  setIsSelectFileModalVisible(value: boolean): void;
}

function AudioPlayer() {
  const playerStore: AudioPlayerStore = useContext(StoresContext).audioPlayer;
  const state = useLocalStore<AudioPlayerState>(() => ({
    currentTime: 0,
    isSeeking: false,
    isSelectFileModalVisible: false,
    setCurrentTime(currentTime: number) { state.currentTime = currentTime; },
    setIsSeeking(value: boolean) { state.isSeeking = value; },
    setIsSelectFileModalVisible(value: boolean) { state.isSelectFileModalVisible = value; }
  }));


  //// EVENT HANDLERS ////

  const onPickFileBtnClicked = async () => {
    //await selectFile(state, playerStore);
    state.setIsSelectFileModalVisible(true);
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

  const onSeekerSlidingStart = (milliseconds: number) => {
    state.setIsSeeking(true);
  }

  const onSeekerSlidingComplete = (milliseconds: number) => {
    state.setIsSeeking(false);
  }

  const onRelativeSeek = useCallback(async (millisecondDelta: number) => {
    await playerStore.relativeSeek(millisecondDelta);
  }, []);

  const onFileSelected = useCallback(async (track: MediaLibrary.Asset) => {
    state.setIsSelectFileModalVisible(false);
    await playerStore.loadFile({uri: track.uri, name: track.filename});
  }, [state, playerStore]);


  //// SETUP EFFECTS ////

  useUpdateTime(state, playerStore);
  useMediaControlNotification(state, playerStore, onPlayPauseBtnClicked, onRelativeSeek);


  //// RENDERING ////

  const trackLength = (playerStore.isLoaded) ? playerStore.player.duration : 0;
  const playPauseBtnIconName = (playerStore.isLoaded && playerStore.playerState === PLAYER_STATES.PLAYING) ? 'pause' : 'play';
  const title = (playerStore.isLoaded) ? playerStore.title : 'Select a track';
  return (
    <View style={styles.mainContainer}>
      <MediaSelector 
        isVisible={state.isSelectFileModalVisible}
        onSelected={(track: MediaLibrary.Asset) => onFileSelected(track)}
      />
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

function updateCurrentTime(state: AudioPlayerState, playerStore: AudioPlayerStore) {
  state.setCurrentTime(playerStore.player.currentTime);
}

/**
 * Prompt user for audio file (using system's file dialog) and load the file for playback
 */
async function selectFile(state: AudioPlayerState, playerStore: AudioPlayerStore) {
  try {

    //console.log("Before Document pciker");
    //const selectedFile = await DocumentPicker.pick({
    //  type: [DocumentPicker.types.audio]
    //});
    //console.log("After Document picker");
    //console.log(selectedFile);

    //const result = await MediaLibrary.getAssetsAsync({mediaType: MediaLibrary.MediaType.audio});
    //console.log(result);

    //console.log('DocumentDirectoryPath: ' + DocumentDirectoryPath);

    //console.log(await FileSystem.getInfoAsync(selectedFile.uri));

    ////const fileStats = await stat(selectedFile.uri);
    ////console.log('filestats');
    ////console.log(fileStats);

    //await playerStore.loadFile({uri: selectedFile.uri, name: selectedFile.name});
    ////await playerStore.loadFile({uri: fileStats.originalFilepath, name: selectedFile.name});

    //updateCurrentTime(state, playerStore);
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
    console.log('[AudioPlayer$useUpdateTime] Running...');

    const _intervalId = setInterval(() => {
      if (playerStore.player !== null && 
          playerStore.player.currentTime !== state.currentTime &&
          !state.isSeeking) {
        updateCurrentTime(state, playerStore);
      }
    }, UPDATE_TIME_FREQ);

    setIntervalId(_intervalId);

    return () => { clearInterval(intervalId) };
  }, []);
}

export default observer(AudioPlayer);
