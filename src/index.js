import React from 'react';
import { Animated, Easing, PanResponder, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import KnobIcon from './KnobIcon';

export default class VerifySlider extends React.Component {
  static propTypes = {
    style: PropTypes.any,
    knobStyle: PropTypes.any
  };
  static defaultProps = {};

  state = {
    valueAnim: new Animated.Value(0),
    sliding: false,
    verified: false,
    willVerify: false,
    _containerWidth: 0,
    _knobWidth: 0
  };

  get upperKnobOffset() {
    return this.state._containerWidth - this.state._knobWidth;
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      // Ask to be the responder
      onStartShouldSetPanResponder: this.hanldeShouldBeResponder,
      onStartShouldSetPanResponderCapture: this.hanldeShouldBeResponder,
      onMoveShouldSetPanResponder: this.hanldeShouldBeResponder,
      onMoveShouldSetPanResponderCapture: this.hanldeShouldBeResponder,

      // Respond
      onPanResponderGrant: this.handlePanResponderGrant, // begin sliding
      onPanResponderMove: this.handlePanResponderMove(), // sliding
      onPanResponderRelease: this.handlePanResponderRelease // slide end
    });

    this.state.valueAnim.addListener(({ value }) => {
      const willVerify = value > 0.7;
      if (willVerify !== this.state.willVerify) {
        this.setState({ willVerify });
      }
    });
  }

  hanldeShouldBeResponder = () => !this.state.sliding;

  handlePanResponderGrant = () => {
    this.setState({
      sliding: true
    });
  };

  handlePanResponderRelease = () => {
    if (this.state.willVerify) {
      this.handleVerifyPassed();
    } else {
      this.handleVerifyFailed();
    }
  };

  handleVerifyPassed = () => {
    Animated.timing(this.state.valueAnim, {
      toValue: 1,
      duration: 150
    }).start(() => {
      this.setState({
        sliding: false,
        verified: true,
        willVerify: false
      });
    });
  };

  handleVerifyFailed = () => {
    Animated.timing(this.state.valueAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.ease
    }).start(() => {
      this.setState({
        sliding: false,
        verified: false,
        willVerify: false
      });
    });
  };

  handlePanResponderMove = () => {
    return Animated.event([], {
      listener: (event, gestureState) => {
        const value = gestureState.dx * (1 / this.upperKnobOffset);
        this.state.valueAnim.setValue(Math.max(0, Math.min(1, value)));
      }
    });
  };

  render() {
    const { style, knobStyle } = this.props;
    const { valueAnim, sliding, willVerify, verified } = this.state;

    const knobOffset = valueAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this.upperKnobOffset]
    });

    const knobIconValue = valueAnim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 1, 1]
    });

    const rightOpacity = valueAnim.interpolate({
      // Start fading out till we're at .7 the size
      inputRange: [0, 0.7],
      outputRange: [1, 0]
    });

    const leftOpacity = valueAnim.interpolate({
      // Start fading in when we're at .3 the size
      inputRange: [0.3, 1],
      outputRange: [0, 1]
    });

    const rightOffsetX = valueAnim.interpolate({
      // Move to the right at half the sliding speed
      inputRange: [0, 1],
      outputRange: [0, this.upperKnobOffset * 0.5]
    });

    const leftOffsetX = valueAnim.interpolate({
      // Move to the right (from left off the screen) util we're at the upper offset at half the sliding speed
      inputRange: [0, 1],
      outputRange: [-(this.upperKnobOffset * 0.5), 0]
    });

    return (
      <View style={[styles.sliderContainer, style]}>
        <View
          onLayout={event =>
            this.setState({
              _containerWidth: event.nativeEvent.layout.width
            })
          }
          style={styles.sliderInnerContainer}
        >
          <Animated.View
            onLayout={event =>
              this.setState({
                _knobWidth: event.nativeEvent.layout.width
              })
            }
            style={[
              styles.sliderKnob,
              knobStyle,
              {
                transform: [{ translateX: knobOffset }, { perspective: 1000 }]
              }
            ]}
            {...this.panResponder.panHandlers}
          >
            <KnobIcon animatedValue={knobIconValue} color="#777" />
          </Animated.View>
          <Animated.View
            style={[
              styles.right,
              {
                transform: [
                  { translateX: rightOffsetX },
                  { perspective: 1000 }
                ],
                opacity: rightOpacity
              }
            ]}
          >
            <Text style={{ color: '#FFF', fontSize: 20 }}>
              Slide on arrival
            </Text>
            <Text style={{ color: '#CCC', fontSize: 13 }}>Jansenstraat 21</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.left,
              {
                transform: [{ translateX: leftOffsetX }, { perspective: 1000 }],
                opacity: leftOpacity
              }
            ]}
          >
            <Text style={{ color: '#FFF', fontSize: 20 }}>Arrived</Text>
          </Animated.View>
        </View>
      </View>
    );
  }
}
