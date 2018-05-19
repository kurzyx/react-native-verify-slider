import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  sliderContainer: {
    elevation: 2,
    height: 80,
    width: 350,
    padding: 2,
    backgroundColor: '#777',
    borderRadius: 9999
  },
  sliderInnerContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  sliderKnob: {
    elevation: 1,
    flex: 0,
    height: 76,
    width: 76,
    backgroundColor: '#FFF',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  right: {
    position: 'absolute',
    left: 76 + 10,
    top: 0,
    right: 20,
    bottom: 0,
    justifyContent: 'center'
  },
  left: {
    position: 'absolute',
    left: 20,
    top: 0,
    right: 76 + 10,
    bottom: 0,
    justifyContent: 'center'
  }
});
