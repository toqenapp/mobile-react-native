import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

import { elementTheme } from "@/src/theme/pick-session-colors";
import { AnimatedShimmerOverlay } from "./AnimatedShimmerOverlay";

export enum ButtonStyle {
  GHOST = "ghost",
  SECONDARY = "secondary",
  PRIMARY = "primary",
  BLACK = "black",
  WHITE = "white",
}

type Props = {
  children?: ReactNode;
  title?: string;
  className?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  styleType?: ButtonStyle;
  height?: number | "100%";
  width?: number | "100%" | "auto";
  rounded?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function AppButton({
  children,
  title,
  className,
  onPress,
  disabled = false,
  loading = false,
  loadingText,
  styleType = ButtonStyle.PRIMARY,
  height = 52,
  width = "auto",
  rounded,
}: Props) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const animateScale = (toValue: number, duration: number) => {
    Animated.timing(pressScale, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    if (isDisabled) return;
    animateScale(0.985, 90);
  };

  const handlePressOut = () => {
    animateScale(1, 120);
  };

  const visual = useMemo(() => {
    switch (styleType) {
      case ButtonStyle.GHOST:
        return {
          useGradient: false,
          backgroundColor: elementTheme.ghostBackground,
          borderColor: elementTheme.ghostBorder,
          borderWidth: 1,
          textColor: elementTheme.ghostText,
          spinnerColor: elementTheme.ghostText,
          opacity: isDisabled ? 0.55 : 1,
        };

      case ButtonStyle.SECONDARY:
        return {
          useGradient: false,
          backgroundColor: elementTheme.secondaryBackground,
          borderColor: elementTheme.secondaryBorder,
          borderWidth: 1,
          textColor: elementTheme.secondaryText,
          spinnerColor: elementTheme.secondaryText,
          opacity: isDisabled ? 0.65 : 1,
        };

      case ButtonStyle.BLACK:
        return {
          useGradient: false,
          backgroundColor: elementTheme.blackBackground,
          borderColor: elementTheme.blackBorder,
          borderWidth: 0,
          textColor: elementTheme.blackText,
          spinnerColor: elementTheme.blackText,
          opacity: isDisabled ? 0.65 : 1,
        };

      case ButtonStyle.WHITE:
        return {
          useGradient: false,
          backgroundColor: elementTheme.whiteBackground,
          borderColor: elementTheme.whiteBorder,
          borderWidth: 1,
          textColor: elementTheme.whiteText,
          spinnerColor: elementTheme.whiteText,
          opacity: isDisabled ? 0.72 : 1,
        };

      case ButtonStyle.PRIMARY:
      default:
        return {
          useGradient: true,
          gradientColors:
            isDisabled && !loading
              ? elementTheme.disabledGradient
              : elementTheme.primaryGradient,
          backgroundColor: undefined,
          borderColor: undefined,
          borderWidth: 0,
          textColor: elementTheme.primaryText,
          spinnerColor: elementTheme.primaryText,
          opacity: isDisabled && !loading ? 0.72 : 1,
        };
    }
  }, [isDisabled, loading, styleType]);

  return (
    <AnimatedView
      className={className}
      style={{
        transform: [{ scale: pressScale }],
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          overflow: "hidden",
        }}
      >
        <View
          className="overflow-hidden  flex justify-center items-center relative"
          style={{
            minHeight: height,
            height: height,
            width,
            opacity: visual.opacity,
            backgroundColor: visual.backgroundColor,
            borderColor: visual.borderColor,
            borderWidth: visual.borderWidth,
            borderRadius: rounded ?? 999,
          }}
        >
          {visual.useGradient ? (
            <LinearGradient
              colors={visual.gradientColors!}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null}

          {loading ? <AnimatedShimmerOverlay visible={loading} /> : null}

          <View
            className="flex-row items-center justify-center px-4"
            style={{ minHeight: height }}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                {loadingText ? (
                  <Text
                    className="ml-2 text-lg font-semibold"
                    style={{ color: visual.textColor }}
                  >
                    {loadingText}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text
                className="text-lg font-semibold"
                style={{ color: visual.textColor }}
              >
                {children || title}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </AnimatedView>
  );
}
