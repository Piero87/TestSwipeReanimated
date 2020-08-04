import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  PanGestureHandler,
  State as GestureState,
  TouchableOpacity
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
const {
  event,
  cond,
  Value,
  block,
  set,
  eq,
  not,
  clockRunning,
  and,
  startClock,
  stopClock,
  spring,
  greaterThan,
  greaterOrEq,
  lessThan,
  call,
  min,
  max,
  add,
  timing,
  Clock,
  Code
} = Animated;

const BUTTON_WIDTH = 75;
const MAX_TRANSLATE = -85;

const Button = ({ item, marginRight, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{ ...s.button, backgroundColor: item.color, marginRight: marginRight ? 10 : 0 }}
      >
        <View style={s.textContainer}>
          <Text style={s.text}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const springConfig = toValue => {

  return {
    toValue: new Value(toValue),
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  }
};

class SwipeRow extends React.Component {
  clock = new Clock();
  clock2 = new Clock();
  gestureState = new Value(GestureState.UNDETERMINED);
  animState = {
    finished: new Value(0),
    position: new Value(0),
    velocity: new Value(0),
    time: new Value(0),
  };
  startX = new Value(0);
  isRemoving = new Value(-1);
  shouldTriggerCallback = new Value(0);

  onOpenCallback = () => {
    console.log("OPEN");
    this.props.onOpen();
  };

  onHandlerStateChange = event([
    {
      nativeEvent: ({ state }) =>
        block([
          // Update our animated value that tracks gesture state
          set(this.gestureState, state),
        ]),
    },
  ]);

  onPanEvent = event([
    {
      nativeEvent: ({ translationX, velocityX }) =>
        block([
          cond(eq(this.gestureState, GestureState.BEGAN), [
            set(this.startX, this.animState.position),
          ]),
          cond(eq(this.gestureState, GestureState.ACTIVE), [
            // Update our translate animated value as the user pans
            set(this.animState.position, min(0, max(add(translationX, this.startX), MAX_TRANSLATE * this.props.buttons.length))),
          ]),
          cond(eq(this.gestureState, GestureState.END), [
            cond(and(lessThan(velocityX, -20), not(clockRunning(this.clock2))), [
              startClock(this.clock2)
            ]),
            cond(and(greaterOrEq(velocityX, -20), not(clockRunning(this.clock))), [
              startClock(this.clock)
            ])

          ])
        ]),
    },
  ]);

  render() {
    const { children, buttons } = this.props;
    return (
      <PanGestureHandler
        minDeltaX={10}
        onGestureEvent={this.onPanEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX: this.animState.position }],
            ...s.base
          }}>
          <Animated.Code>
            {() =>
              block([
                // If the clock is running, increment position in next tick by calling spring()
                cond(clockRunning(this.clock), [
                  spring(this.clock, this.animState, springConfig(0)),
                  // Stop and reset clock when spring is complete
                  cond(this.animState.finished, [
                    stopClock(this.clock),
                    set(this.animState.finished, 0),
                  ]),
                ]),
                cond(clockRunning(this.clock2), [
                  spring(this.clock2, this.animState, springConfig(MAX_TRANSLATE * this.props.buttons.length)),
                  // Stop and reset clock when spring is complete
                  cond(this.animState.finished, [
                    stopClock(this.clock2),
                    set(this.animState.finished, 0),
                    set(this.shouldTriggerCallback, 1)
                  ]),
                ]),
              ])
            }
          </Animated.Code>
          <Code exec={
            () =>
              block([
                call([this.shouldTriggerCallback], () => this.onOpenCallback()),
                set(this.shouldTriggerCallback, 0)])}
          />
          {children}
          <View style={{ ...s.buttonsContainer, width: (BUTTON_WIDTH * buttons.length) }}>
            {
              buttons.map((b, i) => {
                return (
                  <Button
                    item={b}
                    key={`swipe_${i}`}
                    marginRight={i < buttons.length - 1}
                    onPress={() => {
                      b.onPress();
                    }}
                  />
                );
              })
            }
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const windowDimensions = Dimensions.get('window');

const s = StyleSheet.create({
  base: {
    alignItems: 'center'
  },
  buttonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 0,
    top: 0,
    left: windowDimensions.width,
  },
  button: {
    overflow: 'hidden',
    width: BUTTON_WIDTH,
    borderRadius: 10,
    top: 0,
    height: 100,
  },
  iconContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  textContainer: {
    flex: 3
  },
  text: {
    color: 'white',
    fontSize: 16,
    padding: 5,
    textAlign: 'center',
  },
});

export default SwipeRow;
