import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default class KnobIcon extends React.Component {
  static propTypes = {
    animatedValue: PropTypes.any.isRequired,
    color: PropTypes.string,
    delay: PropTypes.number,
    size: PropTypes.number,
    width: PropTypes.number
  };

  static defaultProps = {
    color: '#000',
    delay: 500,
    size: 15,
    width: 3
  };

  render() {
    const { size, width, color, animatedValue } = this.props;

    const rotation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['135deg', '225deg']
    });

    const leftLineSize = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size, size * 0.8]
    });

    const rightLineSize = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size, size * 1.5]
    });

    return (
      <View
        style={[
          styles.container,
          {
            height: size * 2,
            width: size * 2
          }
        ]}
      >
        <Animated.View
          style={{
            // To manage the length of the two lines, adjust the width (for the first line) and height (for the second line.)
            // The lines will automatically adjust their sizes accordingly because their absolute position offset is set to 0 (top,bottom / left,right)
            width: leftLineSize,
            height: rightLineSize,
            transform: [
              { rotate: rotation },
              // Since we're only drawing on half of the rotated square, we have to adjust
              // the position a bit to be in the center
              { translateX: size * 0.125 },
              { translateY: size * 0.125 }
            ]
          }}
        >
          <View
            style={{
              position: 'absolute', // set to absolute, so that it does not interfere with the other line
              height: width,
              left: 0,
              right: 0,
              backgroundColor: color,
              borderRadius: width / 2
            }}
          />
          <View
            style={{
              position: 'absolute', // set to absolute, so that it does not interfere with the other line
              width: width,
              top: 0,
              bottom: 0,
              backgroundColor: color,
              borderRadius: width / 2
            }}
          />
        </Animated.View>
      </View>
    );
  }
}
