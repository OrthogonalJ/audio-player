import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
