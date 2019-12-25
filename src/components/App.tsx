import React, { useEffect, useState } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import AudioPlayer from './AudioPlayer';
import StoresContext, { makeStoresContext, IStoresContext } from '../contexts/storesContext';
import { PermissionService } from '../services/permissionsService';

function App() {
  const [stores, setStores] = useState(makeStoresContext());

  useSetupPermissionsEffect();
  useAppOnCloseEffect(stores);

  return (
    <StoresContext.Provider value={stores}>
      <AudioPlayer/>
    </StoresContext.Provider>
  );
}

function useSetupPermissionsEffect() {
  useEffect(() => {
    PermissionService.requestMissingBasePermissions();
  });
}

function useAppOnCloseEffect(stores: IStoresContext) {
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