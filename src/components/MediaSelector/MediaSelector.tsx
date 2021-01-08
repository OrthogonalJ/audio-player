import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { observer, Observer } from 'mobx-react';
import * as MediaLibrary from 'expo-media-library';

import styles from './MediaSelectorStyles';

const PAGE_SIZE = 20;

enum TrackSortType {
  modificationTime = MediaLibrary.SortBy.modificationTime,
  name = MediaLibrary.SortBy.default,
};

function MediaSelector(props: { isVisible: boolean, onSelected: (asset: MediaLibrary.Asset) => void }) {
  const [tracks, setTracks] = useState<MediaLibrary.Asset[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<string>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(null);
  const [trackSortType, setTrackSortType] = useState<TrackSortType>(TrackSortType.name);

  // HELPERS //
  
  const reset = () => {
    setTracks([]);
    setLastPage(null);
    setHasNextPage(null);
    setIsLoaded(false);
  };

  const _loadAudioTracks = useCallback(async (overwrite = false) => {
    await loadAudioTracks(
      setTracks, 
      lastPage, 
      setLastPage, 
      setHasNextPage, 
      { overwrite, sortBy: trackSortType }
    );
  }, [setTracks, lastPage, setLastPage, setHasNextPage, hasNextPage, trackSortType]);

  const onLoadMore = useCallback(async () => {
    console.log('[MediaSelector$onLoadMode] Running...');
    if (hasNextPage !== null && hasNextPage) {
      await _loadAudioTracks(true);
    }
  }, [hasNextPage, _loadAudioTracks]);

  // EFFECTS //

  useEffect(() => {
    if (!isLoaded && props.isVisible) {
      console.log('[MediaSelector$useEffect1] Loading initial tracks...');
      _loadAudioTracks().then(() => { setIsLoaded(true); } );
    }
  }, [isLoaded, props.isVisible, _loadAudioTracks, setIsLoaded]);

  // RENDERING //
  
  const renderTrackItem = useCallback(({ item }) => {
    //console.log('rendering track');
    //console.log(item);
    return (
      <Observer>{() => (
        <View style={styles.trackItem}>
          <Text onPress={() => props.onSelected(item)}>
            {item.filename}
          </Text>
        </View>
      )}</Observer>
    );
  }, [props.onSelected]);

  const getTrackItemKey = useCallback((item, index) => (index.toString()), []);

  const renderLoadMoreBtn = useCallback(() => (
    <View style={styles.loadMoreBtn}>
      <Button title='Load more' onPress={() => onLoadMore()} />
    </View>
  ), [onLoadMore]);

  const renderTrackList = () => {
    console.log('rendering track list');
    console.log(tracks.map((track) => track.id));
    return (
      <>
        <FlatList
          style={styles.trackList}
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={getTrackItemKey}
          onEndReached={() => onLoadMore()}
        />
        { /* (hasNextPage) ? renderLoadMoreBtn() : null */}
      </>
    );
  };

  const renderLoadingMessage = () => (
    <Text>Loading...</Text>
  );
  
  const content = (isLoaded) ? renderTrackList() : renderLoadingMessage();

  console.log('MediaSelector rendering...');

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.isVisible}>
      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Audio</Text>
        </View>
        <View>
          <Picker
            selectedValue={trackSortType}
            onValueChange={(value) => {
              setTrackSortType(value);
              reset();
            }}
            style={{height: 50, width: 100}}
          >
            <Picker.Item label='Name' value={TrackSortType.name} />
            <Picker.Item label='Date modified' value={TrackSortType.modificationTime} />
          </Picker>
        </View>
      </View>
      <View style={styles.contentContainer}>
        {content}
      </View>
    </Modal>
  );
}

async function loadAudioTracks(
    setTracks: (fn: (tracks: MediaLibrary.Asset[]) => MediaLibrary.Asset[]) => void,
    lastPage: string | null,
    setLastPage: (val: string | null) => void,
    setHasNextPage: (val: boolean) => void,
    settings?: {overwrite?: boolean, sortBy?: boolean}) {
  settings = {
    overwrite: false,
    sortBy: TrackSortType.name,
    ...(settings || {})
  };

  let options = { 
    first: PAGE_SIZE, 
    mediaType: MediaLibrary.MediaType.audio,
    sortBy: settings.sortBy
  };

  if (lastPage !== null) {
    options['after'] = lastPage;
  }

  console.log(`ediaSelector$loadAudioTracks] Getting media assets with options ${JSON.stringify(options)}`);
  const results = await MediaLibrary.getAssetsAsync(options);
  console.log(`MediaSelector$loadAudioTracks] results: ${JSON.stringify(results)}`);

  setLastPage(results.endCursor);
  setTracks((currentTracks: MediaLibrary.Asset[]): MediaLibrary.Asset[] => {
    if (settings.overwrite) return results.assets;
    return currentTracks.concat(results.assets);
  });
  setHasNextPage(results.hasNextPage);
}

export default observer(MediaSelector);
