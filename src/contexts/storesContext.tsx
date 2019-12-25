import React from 'react';
import { AudioPlayerStore } from '../stores/audioPlayerStore';

export interface IStoresContext {
  audioPlayer: AudioPlayerStore;
}

export function makeStoresContext(): IStoresContext {
  return {
    audioPlayer: new AudioPlayerStore()
  };
}

export const StoresContext = React.createContext<IStoresContext>(null);
export default StoresContext;