import { View, Text } from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';
import { observer } from 'mobx-react';
import { formatTime } from '../../utils/timeUtils';

import styles from './TimeSeekerInputStyles';

interface TimeSeekerInputProps {
  value: number;
  maxMilliseconds: number;
  disabled: boolean;
  onValueChange: (milliseconds: number) => void;
  onSlidingStart: (milliseconds: number) => void;
  onSlidingComplete: (milliseconds: number) => void;
}

function TimeSeekerInput(props: TimeSeekerInputProps) {
  return (
    <View style={styles.timeSeekerInputContainer}>
      <Text>{formatTime(props.value)}/{formatTime(props.maxMilliseconds)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={props.maxMilliseconds}
        disabled={props.disabled}
        value={props.value}
        onValueChange={props.onValueChange}
        onSlidingStart={props.onSlidingStart}
        onSlidingComplete={props.onSlidingComplete}
      />
    </View>
  );
}

export default observer(TimeSeekerInput);