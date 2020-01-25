import React, { useEffect, useState } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import AudioPlayer from './AudioPlayer';
import StoresContext, { makeStoresContext, IStoresContext } from '../contexts/storesContext';
import { PermissionService } from '../services/permissionsService';
import { AudioPlayerStore } from '../stores/audioPlayerStore';
import { FileNotFoundError } from '../exceptions/fileNotFoundError';
import { NoStoredDataError } from '../exceptions/noStoredDataError';

function App() {
  const [stores, setStores] = useState(makeStoresContext());

  useSetupPermissions();
  useLoadLastOpennedTrack(stores.audioPlayer);
  useAppOnClose(stores);

  return (
    <StoresContext.Provider value={stores}>
      <AudioPlayer/>
    </StoresContext.Provider>
  );
}

function useLoadLastOpennedTrack(playerStore: AudioPlayerStore) {
  useEffect(() => {
    (async () => {
      try {
        await playerStore.loadLastOpennedTrack();
      } catch (error) {
        if (!(error instanceof FileNotFoundError || error instanceof NoStoredDataError)) {
          console.error('Error encountered during last openned track load: ', error);
        } else {
          console.log('Last track not found');
        }
      }
    })();
  }, []);
}

function useSetupPermissions() {
  useEffect(() => {
    PermissionService.requestMissingBasePermissions();
  }, []);
}

function useAppOnClose(stores: IStoresContext) {
  useEffect(() => {
    return () => {
      // NOTE: this is async
      stores.audioPlayer.reset();
    };
  }, [stores]);
}

const AppNavigator = createStackNavigator(
  {
    AudioPlayer: AudioPlayer,
    Home: App
  },
  { initialRouteName: 'Home' }
);

const AppContainer = createAppContainer(AppNavigator);
export default AppContainer;