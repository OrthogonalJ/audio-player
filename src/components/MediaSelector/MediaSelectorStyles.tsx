import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  titleContainer: {
    minHeight: 40,
    width: '100%',
    textAlign: 'center',
    alignItems: 'center',
    padding: 2
  },
  title: {
    fontSize: 32
  },
  contentContainer: {
    flex: 1
  },
  trackList: {
    flex: 1,
    marginBottom: 40
  },
  trackItem: {
    flex: 1,
    minHeight: 40,
    padding: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'black'
  },
  loadMoreBtn: {
    height: 10, 
    bottom: 0
  }
});
