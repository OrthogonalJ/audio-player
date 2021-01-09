import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { observer, Observer } from 'mobx-react';
import * as MediaLibrary from 'expo-media-library';
import { formatDate, formatTime, TimeFormat } from '../../utils/timeUtils';

import styles from './MediaSelectorModalStyles';

const PAGE_SIZE = 20;

enum TrackSortType {
  modificationTime = MediaLibrary.SortBy.modificationTime,
  name = MediaLibrary.SortBy.default,
};

interface IMediaSelectorModalProps {
  isVisible: boolean;
  onSelected: (asset: MediaLibrary.Asset) => void;
  onClose: () => void;
}

function MediaSelectorModal(props: IMediaSelectorModalProps) {
  const [tracks, setTracks] = useState<MediaLibrary.Asset[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    try {
      if (!isLoading) {
        setIsLoading(true);
        await loadAudioTracks(
          setTracks, 
          setLastPage, 
          setHasNextPage, 
          { 
            overwrite, 
            sortBy: trackSortType, 
            lastPage: (!overwrite) ? lastPage : null 
          }
        );
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  }, [lastPage, trackSortType, isLoading]);


  // EVENT HANDLERS //

  const onLoadMore = useCallback(async () => {
    console.log(`[MediaSelector$onLoadMode] Running... (state: ${JSON.stringify({lastPage, hasNextPage, isLoaded, trasksLen: tracks.length})})`);
    if (hasNextPage !== null && hasNextPage) {
      await _loadAudioTracks();
    }
  }, [hasNextPage, _loadAudioTracks]);

  const onChangeSortType = useCallback((value) => {
    setTrackSortType(value);
    reset();
  }, []);


  // EFFECTS //

  useEffect(() => {
    if (!isLoaded && props.isVisible) {
      console.log('[MediaSelector$useEffect1] Loading initial tracks...');
      _loadAudioTracks(true).then(() => { setIsLoaded(true); } );
    } else if (!props.isVisible) {
      reset();
    }
  }, [isLoaded, props.isVisible, _loadAudioTracks]);


  // RENDERING //
  
  const renderTrackItem = useCallback(({ item, index }) => {
    return (
      <Observer>{() => (
        <TouchableOpacity style={styles.trackItem} onPress={() => props.onSelected(item)}>
          <View style={styles.trackItemHeaderContainer}>
            <Text style={styles.trackNameText}>
              {item.filename}
            </Text>
          </View>
          <View style={styles.trackItemBodyContainer}>
            <Text style={styles.trackDateText}>
              {formatDate(item.modificationTime)}
            </Text>
            <Text style={styles.trackDuration}>
              {formatTime(item.duration * 1000, TimeFormat.MMSS)}
            </Text>
          </View>
        </TouchableOpacity>
      )}</Observer>
    );
  }, [props.onSelected]);

  const renderTrackList = () => {
    return (
      <FlatList
        style={styles.trackList}
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={() => onLoadMore()}
        extraData={lastPage}
      />
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
      visible={props.isVisible}
      onRequestClose={props.onClose}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Audio</Text>
        <View style={styles.controlContainer}>
          <Text style={styles.sortTypeLabel}>Sort By</Text>
          <Picker
            selectedValue={trackSortType}
            onValueChange={onChangeSortType}
            style={styles.sortTypeSelector}
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
    setLastPage: (val: string | null) => void,
    setHasNextPage: (val: boolean) => void,
    settings: {sortBy: TrackSortType, overwrite?: boolean, lastPage?: string | null}) {
  settings = {
    overwrite: false,
    lastPage: null,
    ...settings
  };

  let queryOptions: any = { 
    first: PAGE_SIZE, 
    mediaType: MediaLibrary.MediaType.audio,
    sortBy: settings.sortBy
  };

  if (settings.lastPage !== null) {
    queryOptions['after'] = settings.lastPage;
  }

  console.log(`[MediaSelector$loadAudioTracks] Getting media assets with options ${JSON.stringify(queryOptions)}`);
  const results = await MediaLibrary.getAssetsAsync(queryOptions);
  console.log(`[MediaSelector$loadAudioTracks] results: ${JSON.stringify(results)}`);

  setLastPage(results.endCursor);
  setTracks((currentTracks: MediaLibrary.Asset[]): MediaLibrary.Asset[] => {
    if (settings.overwrite) return [...results.assets];
    return currentTracks.concat(results.assets);
  });
  setHasNextPage(results.hasNextPage);
}

export default observer(MediaSelectorModal);
