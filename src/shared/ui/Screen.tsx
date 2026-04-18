import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  withTopInset?: boolean;
  withBottomInset?: boolean;
};

export function Screen({
  children,
  style,
  withTopInset = true,
  withBottomInset = true,
}: Props) {
  const edges: ("top" | "bottom")[] = [];

  if (withTopInset) edges.push("top");
  if (withBottomInset) edges.push("bottom");

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: "#0B1020" }}>
      <View className="flex-1">
        <View className="flex-1" style={style}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
