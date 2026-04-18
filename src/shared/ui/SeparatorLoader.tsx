import { pickSessionColors } from "@/src/theme/pick-session-colors";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, useWindowDimensions, View } from "react-native";

type Props = {
  show?: boolean;
  height?: number;
  maxWidth?: number | "100%";
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function SeparatorLoader({ show = false, height = 2, maxWidth }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;

  const { edgeColor, centerColor } = useMemo(
    () => pickSessionColors({ centerAlpha: 1 }),
    [],
  );

  const colors = useMemo(
    () => [edgeColor, centerColor, edgeColor] as const,
    [edgeColor, centerColor],
  );

  useEffect(() => {
    if (!show || width <= 0) {
      translateX.stopAnimation();
      translateX.setValue(0);
      return;
    }

    const from = -width * 2.1;
    const to = width * 2.1;

    translateX.setValue(from);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: to,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
      translateX.stopAnimation();
    };
  }, [show, width, translateX]);

  if (!show) return null;

  return (
    <View
      pointerEvents="none"
      className="w-full relative z-50 overflow-hidden"
      style={{ height, maxWidth }}
    >
      <AnimatedView
        style={{
          width: width * 2.1,
          height,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </AnimatedView>
    </View>
  );
}
