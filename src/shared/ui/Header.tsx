import { ReactNode, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  right?: ReactNode;
  left?: ReactNode;
  paddingTop?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  height?: number | "auto" | "100%";
};

export function Header({
  title,
  left,
  right,
  height = "auto",
  paddingTop = 21,
  paddingBottom = 5,
  paddingHorizontal = 21,
}: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          height,
          paddingTop,
          paddingBottom,
          paddingHorizontal,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        title: {
          fontSize: 24,
          fontWeight: "700",
          color: "#cccccc",
        },
        right: {
          minWidth: 24,
          alignItems: "flex-end",
        },
        left: {
          minWidth: 24,
          alignItems: "flex-start",
        },
      }),
    [height, paddingTop, paddingBottom, paddingHorizontal],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.left}>{left}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}
