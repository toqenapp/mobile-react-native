import { AppText } from "@/src/shared/ui/AppText";
import { SeparatorLoader } from "@/src/shared/ui/SeparatorLoader";
import { CameraView } from "expo-camera";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  renderCamera: boolean;
  locked: boolean;
  onBarcodeScanned: ({ data }: { data: string }) => void;
};

export const CameraBlock = memo(function CameraBlock({
  renderCamera,
  locked,
  onBarcodeScanned,
}: Props) {
  const shouldShowCamera = renderCamera && !locked;

  return (
    <View className="w-full flex-1 rounded-[20px] overflow-hidden relative bg-[#0B1020]">
      {shouldShowCamera ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />
      ) : (
        <View className="absolute inset-0 bg-[#0B1020]" />
      )}

      {locked ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="items-center w-2/3 gap-6">
            <AppText>Applying...</AppText>
            <SeparatorLoader show />
          </View>
        </View>
      ) : null}
    </View>
  );
});
