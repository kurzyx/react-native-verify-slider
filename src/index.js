import React from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  View,
  Text
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import KnobIcon from './KnobIcon';

export default class VerifySlider extends React.Component {
  static propTypes = {
    style: PropTypes.any,
    renderKnobIcon: PropTypes.func,
    renderLeft: PropTypes.func,
    renderRight: PropTypes.func
  };

  static defaultProps = {
    renderKnobIcon: props => <KnobIcon {...props} />,
    renderLeft: () => null,
    renderRight: () => null
  };

  state = {
    slidingValue: new Animated.Value(0),
    verifyValue: new Animated.Value(0),
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

    this.state.slidingValue.addListener(({ value }) => {
      const willVerify = value > 0.7;
      if (willVerify !== this.state.willVerify) {
        this.setState({ willVerify });
      }
    });
  }

  hanldeShouldBeResponder = () =>
    /* !this.state.verified && */ !this.state.sliding;

  handlePanResponderGrant = () => {
    this.setState({
      verifyValue: new Animated.Value(0),
      verified: false,
      sliding: true
    });
  };

  handlePanResponderMove = () => {
    return Animated.event(
      [
        // TODO: Pass current offset?
      ],
      {
        listener: (event, gestureState) => {
          const value = gestureState.dx * (1 / this.upperKnobOffset);
          this.state.slidingValue.setValue(Math.max(0, Math.min(1, value)));
        }
      }
    );
  };

  handlePanResponderRelease = () => {
    if (this.state.willVerify) {
      this.handleVerifyPassed();
    } else {
      this.handleVerifyFailed();
    }
  };

  handleVerifyPassed = () => {
    Animated.sequence([
      // finish sliding the knob
      Animated.spring(this.state.slidingValue, {
        toValue: 1,
        overshootClamping: true // do not bounce
      }),
      // transform knob to just the icon
      Animated.timing(this.state.verifyValue, {
        toValue: 1,
        duration: 500
      })
    ]).start(() => {
      this.setState({
        sliding: false,
        verified: true,
        willVerify: false
      });
    });
  };

  handleVerifyFailed = () => {
    // slide back
    Animated.timing(this.state.slidingValue, {
      toValue: 0,
      duration: 250,
      easing: Easing.ease
    }).start(() => {
      this.setState({
        sliding: false
      });
    });
  };

  renderRight() {
    const content = this.props.renderRight();

    if (null === content) {
      return null;
    }

    const opacity = this.state.slidingValue.interpolate({
      // Start fading out till we're at .7 the size
      inputRange: [0, 0.7],
      outputRange: [1, 0]
    });

    const offset = this.state.slidingValue.interpolate({
      // Move to the right at half the sliding speed
      inputRange: [0, 1],
      outputRange: [0, this.upperKnobOffset * 0.5]
    });

    return (
      <Animated.View
        style={[
          styles.right,
          {
            opacity: opacity,
            transform: [{ translateX: offset }]
          }
        ]}
      >
        {content}
      </Animated.View>
    );
  }

  renderLeft() {
    const content = this.props.renderLeft();

    if (null === content) {
      return null;
    }

    const opacity = this.state.slidingValue.interpolate({
      // Start fading in when we're at .3 the size
      inputRange: [0.3, 1],
      outputRange: [0, 1]
    });

    const offset = this.state.slidingValue.interpolate({
      // Move to the right (from left off the screen) util we're at the upper offset at half the sliding speed
      inputRange: [0, 1],
      outputRange: [-(this.upperKnobOffset * 0.5), 0]
    });

    return (
      <Animated.View
        style={[
          styles.left,
          {
            opacity: opacity,
            transform: [{ translateX: offset }]
          }
        ]}
      >
        {content}
      </Animated.View>
    );
  }

  _renderKnobIcon(color) {
    const { renderKnobIcon } = this.props;
    const { slidingValue, sliding, willVerify, verified } = this.state;

    const animatedValue = slidingValue.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 1, 1]
    });

    return renderKnobIcon({
      animatedValue,
      color,
      sliding,
      willVerify,
      verified
    });
  }

  renderKnob() {
    const { slidingValue, verifyValue } = this.state;

    const knobOffset = slidingValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this.upperKnobOffset]
    });

    const knobScale = verifyValue.interpolate({
      inputRange: [0, 0.5, 0.5],
      outputRange: [1, 0.01, 0.01]
    });

    const knobOpacity = verifyValue.interpolate({
      inputRange: [0, 0.1, 0.3, 0.5, 0.5],
      outputRange: [1, 1, 0, 0, 0]
    });

    // bounce
    const simpleKnobScale = verifyValue.interpolate({
      inputRange: [0, 0.2, 0.4, 0.8, 1, 1],
      outputRange: [1, 1, 1.5, 0.75, 1, 1]
    });

    const simpleKnobOpacity = verifyValue.interpolate({
      inputRange: [0, 0.1, 0.25, 0.5, 0.5],
      outputRange: [0, 0, 1, 1, 1]
    });

    return (
      <Animated.View
        style={[
          styles.sliderKnobContainer,
          {
            transform: [{ translateX: knobOffset }]
          }
        ]}
        onLayout={event =>
          this.setState({
            _knobWidth: event.nativeEvent.layout.width
          })
        }
        {...this.panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.sliderKnob,
            {
              elevation: 1,
              ...StyleSheet.absoluteFillObject,
              transform: [{ scale: knobScale }],
              opacity: knobOpacity,
              backgroundColor: '#FFF'
            }
          ]}
        >
          {this._renderKnobIcon('#777')}
        </Animated.View>
        <Animated.View
          style={[
            styles.sliderKnob,
            {
              ...StyleSheet.absoluteFillObject,
              transform: [{ scale: simpleKnobScale }],
              opacity: simpleKnobOpacity
            }
          ]}
        >
          {this._renderKnobIcon('#fff')}
        </Animated.View>
      </Animated.View>
    );
  }

  render() {
    const { style } = this.props;

    return (
      <View style={[styles.sliderContainer, style]}>
        <View
          style={styles.sliderInnerContainer}
          onLayout={event =>
            this.setState({
              _containerWidth: event.nativeEvent.layout.width
            })
          }
        >
          {this.renderLeft()}
          {this.renderRight()}
          {/* Render knob last (or above left and right), otherwise we require to set the zIndex style property */}
          {this.renderKnob()}
        </View>
      </View>
    );
  }
}
