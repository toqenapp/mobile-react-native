import { ReactNode } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";

type Props = TextProps & {
  children: ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({ children, className, style, ...rest }: Props) {
  return (
    <Text {...rest} className={className || "text-text"} style={style}>
      {children}
    </Text>
  );
}
