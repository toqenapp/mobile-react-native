import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <View
      className={`rounded-xl border border-border bg-surface p-4 ${className || ""}`}
    >
      {children}
    </View>
  );
}
