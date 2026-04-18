import { pickSessionColors } from "@/src/theme/pick-session-colors";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";

type Props = {
  visible?: boolean;
  shimmerWidth?: number;
  travelDistance?: number;
  duration?: number;
  rotateDeg?: number;
};

const AnimatedView = Animated.createAnimatedComponent(Animated.View);

export function AnimatedShimmerOverlay({
  visible = false,
  shimmerWidth = 100,
  travelDistance = 550,
  duration = 1300,
  rotateDeg = 34,
}: Props) {
  const translateX = useRef(new Animated.Value(-travelDistance)).current;

  const { edgeColor, centerColor } = useMemo(() => pickSessionColors(), []);

  useEffect(() => {
    if (!visible) {
      translateX.stopAnimation();
      translateX.setValue(-travelDistance);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: travelDistance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
      translateX.stopAnimation();
    };
  }, [visible, travelDistance, translateX, duration]);

  if (!visible) return null;

  const shimmerColors = [edgeColor, centerColor, edgeColor] as const;

  return (
    <View
      className=""
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AnimatedView
        pointerEvents="none"
        style={{
          width: shimmerWidth,
          height: "300%",
          transform: [{ translateX }, { rotate: `${rotateDeg}deg` }],
        }}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </AnimatedView>
    </View>
  );
}
