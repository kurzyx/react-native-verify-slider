import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  line: {
    position: 'absolute',
    borderRadius: 2
  }
});

export default class KnobIcon extends React.Component {
  static propTypes = {
    animatedValue: PropTypes.any.isRequired,
    color: PropTypes.string,
    delay: PropTypes.number,
    size: PropTypes.number
  };

  static defaultProps = {
    color: '#000',
    delay: 500,
    size: 15
  };

  render() {
    const { size, color, animatedValue } = this.props;

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
      <View>
        <View
          style={[
            styles.container,
            {
              height: size * 2,
              width: size * 2,
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}
        >
          <Animated.View
            style={{
              width: leftLineSize,
              height: rightLineSize,
              transform: [
                { rotate: rotation },
                { translateX: size * 0.125 },
                { translateY: size * 0.125 }
              ]
            }}
          >
            <Animated.View
              style={[
                styles.line,
                {
                  backgroundColor: color,
                  height: 3,
                  width: leftLineSize
                }
              ]}
            />
            <Animated.View
              style={[
                styles.line,
                {
                  backgroundColor: color,
                  height: rightLineSize,
                  width: 3
                }
              ]}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}
