import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    elevation: 2,
    height: 80,
    width: 350,
    padding: 2,
    backgroundColor: '#777',
    borderRadius: 9999
  },
  buttonContainer: {
    height: '100%',
    aspectRatio: 1
  },
  button: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonStyled: {
    elevation: 1,
    backgroundColor: '#FFF'
  },
  rightContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 20,
    justifyContent: 'center'
  },
  leftContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingLeft: 20,
    paddingRight: 10,
    justifyContent: 'center'
  }
});
