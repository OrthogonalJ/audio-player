import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';
import { observer } from 'mobx-react';
import { formatTime } from '../utils/timeUtils';

const styles = StyleSheet.create({
  timeSeekerInputContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  slider: {
    width: '100%'
  }
});

interface TimeSeekerInputState {
  duration: number;
  setDuration: (duration: number) => void;
}

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
        onSlidingComplete={props.onSlidingComplete}/>
    </View>
  );

  // const onChange = useCallback((textValue: string) => {
  //   try {
  //     const parts = textValue.split(':');
  //     setDuration(milliseconds);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);

  // return (
  //   <TextInput
  //     keyboardType='numeric'
  //     value={formatTime(duration)}
  //     onChangeText={onChange}/>
  // );
}

export default observer(TimeSeekerInput);