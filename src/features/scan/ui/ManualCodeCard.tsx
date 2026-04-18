import { memo } from "react";
import { Pressable, TextInput, View } from "react-native";

import { CodeCells } from "@/src/features/scan/ui/CodeCells";
import { AppButton } from "@/src/shared/ui/AppButton";
import { Card } from "@/src/shared/ui/Card";

type Props = {
  inputRef: React.RefObject<TextInput | null>;
  manualCode: string;
  codeLength: number;
  isKeyboardVisible: boolean;
  locked: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export const ManualCodeCard = memo(function ManualCodeCard({
  inputRef,
  manualCode,
  codeLength,
  isKeyboardVisible,
  locked,
  onChangeText,
  onSubmit,
}: Props) {
  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Card>
        <CodeCells
          locked={locked}
          value={manualCode}
          length={codeLength}
          isKeyboardVisible={isKeyboardVisible}
        />

        <TextInput
          ref={inputRef}
          value={manualCode}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={codeLength}
          showSoftInputOnFocus
          style={{
            position: "absolute",
            opacity: 0,
            width: 1,
            height: 1,
          }}
        />

        {isKeyboardVisible ? (
          <View className="mt-8">
            <AppButton
              title="Apply"
              loadingText="Applying..."
              loading={locked}
              onPress={() => void onSubmit()}
            />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
});
