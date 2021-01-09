import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  titleContainer: {
    minHeight: 80,
    width: '100%',
    //alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    flex: 1,
    marginVertical: 5,
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
    borderTopColor: 'rgba(34, 36, 38, .15)',
  },
  loadMoreBtn: {
    height: 10, 
    bottom: 0
  },
  controlContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortTypeLabel: {
    fontSize: 15,
    paddingLeft: 10,
  },
  sortTypeSelector: {
    height: 50,
    width: 150,
  },
  trackDateText: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
  trackNameText: {

  },
  trackDuration: {
    color: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: 10,
  },
  trackItemHeaderContainer: {
    flex: 1,
  },
  trackItemBodyContainer: {
    flex: 1,
    flexDirection: 'row'
  }
});
