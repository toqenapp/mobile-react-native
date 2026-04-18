import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export function BackButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        height: 44,
        width: 56,
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 17,
      }}
    >
      <FontAwesome6 name="arrow-left-long" size={21} color="#aaa" />
    </Pressable>
  );
}
