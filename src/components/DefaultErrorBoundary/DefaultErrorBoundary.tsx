import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { observer, Observer } from 'mobx-react';
import * as MediaLibrary from 'expo-media-library';
import { formatDate, formatTime, TimeFormat } from '../../utils/timeUtils';

import styles from './DefaultErrorBoundaryStyles';

interface IDefaultErrorBoundaryProps {
  children: any;
}

interface IDefaultErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class DefaultErrorBoundary extends React.Component<IDefaultErrorBoundaryProps, IDefaultErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {    
    return { hasError: true, error: error}; 
  }

  //componentDidCatch(error, errorInfo) {
  //  // You can also log the error to an error reporting service
  //  //logErrorToMyService(error, errorInfo);
  //}

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>
            Something went wrong.
          </Text>
          <Text>
            {this.state.error.toString()}
            {typeof this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children; 
  }
}

export default observer(DefaultErrorBoundary);
