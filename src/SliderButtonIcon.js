import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

export default class SliderButtonIcon extends React.Component {
  static propTypes = {
    animatedValue: PropTypes.any.isRequired,
    size: PropTypes.number,
    width: PropTypes.number,
    color: PropTypes.string
  };

  static defaultProps = {
    size: 15,
    width: 3,
    color: '#000'
  };

  render() {
    const { animatedValue, size, width, color } = this.props;

    const rotation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['135deg', '225deg']
    });

    const line1Size = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size, size * 0.8]
    });

    const line2Size = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size, size * 1.5]
    });

    return (
      <View
        style={[
          styles.container,
          {
            // Since we're rotating a square; it will get bigger in width and height, so to be safe double the container's size
            height: size * 2,
            width: size * 2
          }
        ]}
      >
        <Animated.View
          style={{
            // To manage the length of the two lines, adjust the width (for the first line) and height (for the second line.)
            // The lines will automatically adjust their sizes accordingly because their absolute position offset is set to 0 (top,bottom / left,right)
            width: line1Size,
            height: line2Size,
            transform: [
              { rotate: rotation },
              // Because we're only drawing on half of the (rotated) square, we have to adjust
              // the position a bit to have it perfectly centered.
              { translateX: size * 0.125 },
              { translateY: size * 0.125 }
            ]
          }}
        >
          <View
            style={{
              position: 'absolute', // set to absolute, to not interfere with the other line
              height: width,
              left: 0,
              right: 0,
              backgroundColor: color,
              borderRadius: width / 2
            }}
          />
          <View
            style={{
              position: 'absolute', // set to absolute, to not interfere with the other line
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
