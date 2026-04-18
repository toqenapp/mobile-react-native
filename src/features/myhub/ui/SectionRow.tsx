import { AppText } from "@/src/shared/ui/AppText";
import { View } from "react-native";

export function SectionRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <View className="flex-row items-start justify-between gap-4">
      <AppText className=" text-neutral-400">{label}</AppText>
      <AppText className="max-w-[68%] text-right text-white">{value}</AppText>
    </View>
  );
}
