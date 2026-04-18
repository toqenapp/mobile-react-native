import { memo, useMemo } from "react";
import { View } from "react-native";

import { AppText } from "@/src/shared/ui/AppText";

type Props = {
  locked: boolean;
  value: string;
  length: number;
  isKeyboardVisible: boolean;
  activeColor?: string;
  inactiveColor?: string;
};

export const CodeCells = memo(function CodeCells({
  locked,
  value,
  length,
  isKeyboardVisible,
}: Props) {
  const cells = useMemo(() => {
    if (locked) {
      return Array.from({ length }, (_, index) => {
        return {
          key: `key-${index}`,
          char: "*",
          isActive: false,
        };
      });
    }
    return Array.from({ length }, (_, index) => {
      const char = value[index] ?? "";
      const isActive =
        (value.length === index && value.length < length) ||
        (index === length - 1 && value.length === length);

      return {
        key: index,
        char,
        isActive,
      };
    });
  }, [length, value, locked]);

  return (
    <View className="flex-row items-center justify-between gap-1">
      {cells.map((cell) => {
        const isActive = isKeyboardVisible && cell.isActive;
        return (
          <View
            key={cell.key}
            className={`${isActive ? "border-primary-600" : "border-gray-800"} h-14 w-12 items-center justify-center bg-gray-800 rounded-lg border`}
          >
            <AppText className="text-2xl font-bold text-gray-300">
              {cell.char || ""}
            </AppText>
          </View>
        );
      })}
    </View>
  );
});
