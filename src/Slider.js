import React from 'react';
import { StyleSheet, Animated, PanResponder, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import SliderButtonIcon from './SliderButtonIcon';

export default class VerifySlider extends React.Component {
  static propTypes = {
    style: PropTypes.any,
    buttonStyle: PropTypes.any,
    buttonContainerStyle: PropTypes.any,
    verifyThreshold: PropTypes.number,
    onVerified: PropTypes.func,
    renderButtonIcon: PropTypes.func,
    renderLeft: PropTypes.func,
    renderRight: PropTypes.func
  };

  static defaultProps = {
    verifyThreshold: 0.7,
    renderButtonIcon: ({ primary, ...props }) => (
      <SliderButtonIcon {...props} color={primary ? '#777' : '#fff'} />
    ),
    renderLeft: () => null,
    renderRight: () => null
  };

  state = {
    sliding: false,
    verified: false,
    willVerify: false,
    _width: 0,
    _buttonWidth: 0
  };

  constructor(props) {
    super(props);

    this._slidingValue = new Animated.Value(0);
    this._buttonTransformValue = new Animated.Value(0);

    this._slidingValue.addListener(({ value }) => {
      const willVerify = value > this.props.verifyThreshold;
      if (willVerify !== this.state.willVerify) {
        this.setState({ willVerify });
      }
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._hanldeShouldSetPanResponder,
      onStartShouldSetPanResponderCapture: this._hanldeShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._hanldeShouldSetPanResponder,
      onMoveShouldSetPanResponderCapture: this._hanldeShouldSetPanResponder,

      onPanResponderGrant: this._handlePanResponderGrant, // begin sliding
      onPanResponderMove: this._handlePanResponderMove, // sliding
      onPanResponderRelease: this._handlePanResponderRelease // slide end
    });
  }

  /**
   * Sets the slider as verified.
   */
  verify(animated = true, callback) {
    // don't bother when already verified
    if (this.state.verified) {
      return;
    }

    const done = () => {
      this.setState({
        sliding: false,
        verified: true
      });
      callback && callback();
      this.props.onVerified && this.props.onVerified();
    };

    if (!animated) {
      this._slidingValue.setValue(1);
      this._buttonTransformValue.setValue(1);

      done();
    } else {
      if (!this.state.sliding) {
        this.setState({ sliding: true });
      }

      Animated.sequence([
        Animated.spring(this._slidingValue, {
          toValue: 1,
          overshootClamping: true // do not bounce
        }),
        Animated.timing(this._buttonTransformValue, {
          toValue: 1,
          duration: 500
        })
      ]).start(done);
    }
  }

  /**
   * Resets the slider.
   */
  reset(animated = true, callback) {
    // don't bother when there's nothing to reset
    if (!this.state.sliding && !this.state.verified) {
      return;
    }

    const done = () => {
      this.setState({
        sliding: false,
        verified: false
      });
      callback && callback();
    };

    if (!animated) {
      this._slidingValue.setValue(0);
      this._buttonTransformValue.setValue(0);

      done();
    } else {
      Animated.parallel([
        Animated.spring(this._slidingValue, {
          toValue: 0,
          overshootClamping: true // do not bounce
        }),
        Animated.timing(this._buttonTransformValue, {
          toValue: 0,
          duration: 300
        })
      ]).start(done);
    }
  }

  get _upperButtonOffset() {
    return this.state._width - this.state._buttonWidth;
  }

  _hanldeShouldSetPanResponder = () =>
    !this.state.verified && !this.state.sliding;

  _handlePanResponderGrant = () => {
    this.setState({ sliding: true });
  };

  _handlePanResponderMove = (event, gestureState) => {
    const value = gestureState.dx * (1 / this._upperButtonOffset);
    this._slidingValue.setValue(
      Math.max(0, Math.min(1, value)) // clamp to 0, 1
    );
  };

  _handlePanResponderRelease = () => {
    if (this.state.willVerify) {
      this.verify();
    } else {
      this.reset();
    }
  };

  _renderLeft() {
    const content = this.props.renderLeft();

    if (null === content) {
      return null;
    }

    const opacity = this._slidingValue.interpolate({
      // Start fading in when we're at .3 the size
      inputRange: [0.3, 1],
      outputRange: [0, 1]
    });

    const offset = this._slidingValue.interpolate({
      // Move to the right (from left off the screen) util we're at the upper offset at half the sliding speed
      inputRange: [0, 1],
      outputRange: [-(this._upperButtonOffset * 0.5), 0]
    });

    return (
      <Animated.View
        style={[
          styles.leftContainer,
          {
            opacity: opacity,
            transform: [{ translateX: offset }],
            right: this.state._buttonWidth // because this is positioned absolute, manually adjust the width so that the button does not overlap
          }
        ]}
      >
        {content}
      </Animated.View>
    );
  }

  _renderRight() {
    const content = this.props.renderRight();

    if (null === content) {
      return null;
    }

    const opacity = this._slidingValue.interpolate({
      // Start fading out till we're at .7 the size
      inputRange: [0, 0.7],
      outputRange: [1, 0]
    });

    const offset = this._slidingValue.interpolate({
      // Move to the right at half the sliding speed
      inputRange: [0, 1],
      outputRange: [0, this._upperButtonOffset * 0.5]
    });

    return (
      <Animated.View
        style={[
          styles.rightContainer,
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

  _renderButtonIcon(primary) {
    const { sliding, willVerify, verified } = this.state;

    const animatedValue = this._slidingValue.interpolate({
      inputRange: [0, this.props.verifyThreshold, 1],
      outputRange: [0, 1, 1]
    });

    return this.props.renderButtonIcon({
      primary,
      animatedValue,
      sliding,
      willVerify,
      verified
    });
  }

  _renderButton() {
    const { buttonStyle, buttonContainerStyle } = this.props;

    const offset = this._slidingValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this._upperButtonOffset]
    });

    // shrink, fade out
    const scale = this._buttonTransformValue.interpolate({
      inputRange: [0, 0.5, 0.5],
      outputRange: [1, 0.01, 0.01]
    });
    const opacity = this._buttonTransformValue.interpolate({
      inputRange: [0, 0.1, 0.3, 0.5, 0.5],
      outputRange: [1, 1, 0, 0, 0]
    });

    // bounce, fade in
    const secondaryScale = this._buttonTransformValue.interpolate({
      inputRange: [0, 0.2, 0.4, 0.8, 1, 1],
      outputRange: [1, 1, 1.5, 0.75, 1, 1]
    });
    const secondaryOpacity = this._buttonTransformValue.interpolate({
      inputRange: [0, 0.1, 0.25, 0.5, 0.5],
      outputRange: [0, 0, 1, 1, 1]
    });

    return (
      <Animated.View
        style={[
          styles.buttonContainer,
          buttonContainerStyle,
          {
            transform: [{ translateX: offset }],
            zIndex: 1
          }
        ]}
        onLayout={event =>
          this.setState({
            _buttonWidth: event.nativeEvent.layout.width
          })
        }
        {...this.panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.button,
            styles.buttonStyled,
            buttonStyle,
            {
              ...StyleSheet.absoluteFillObject,
              transform: [{ scale: scale }],
              opacity: opacity
            }
          ]}
        >
          {this._renderButtonIcon(true)}
        </Animated.View>
        <Animated.View
          style={[
            styles.button,
            {
              ...StyleSheet.absoluteFillObject,
              transform: [{ scale: secondaryScale }],
              opacity: secondaryOpacity
            }
          ]}
        >
          {this._renderButtonIcon(false)}
        </Animated.View>
      </Animated.View>
    );
  }

  render() {
    const { style } = this.props;

    return (
      <View style={[styles.container, style]}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row'
          }}
          onLayout={event =>
            this.setState({
              _width: event.nativeEvent.layout.width
            })
          }
        >
          {this._renderLeft()}
          {this._renderButton()}
          {this._renderRight()}
        </View>
      </View>
    );
  }
}
