import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, Easing } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function TabFadeScaleIn({ children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      scale.setValue(0.9);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 210,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, [opacity, scale]),
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ scale }],
      }}
    >
      {children}
    </Animated.View>
  );
}
