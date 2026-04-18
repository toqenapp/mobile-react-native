import { AppText } from "@/src/shared/ui/AppText";
import { View } from "react-native";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="px-4 py-2">
      <AppText className="text-base font-semibold text-white">{title}</AppText>
      <AppText className="mt-1 text-sm leading-5 text-neutral-400">
        {description}
      </AppText>
    </View>
  );
}
