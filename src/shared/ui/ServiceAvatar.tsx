import { useMemo, useState } from "react";
import { Image, View } from "react-native";

import { AppText } from "@/src/shared/ui/AppText";

type Props = {
  name?: string | null;
  logoUrl?: string | null;
  size?: number;
  brandColor?: string | null;
};

export function ServiceAvatar({ name, logoUrl, size = 64, brandColor }: Props) {
  const [error, setError] = useState(false);

  const initials = useMemo(() => getInitials(name), [name]);
  const borderRadius = Math.round(size * 0.22);

  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: brandColor ?? "#1F2937",
      }}
    >
      {logoUrl && !error ? (
        <Image
          source={{ uri: logoUrl }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setError(true)}
        />
      ) : (
        <AppText
          style={{
            fontSize: size * 0.32,
            lineHeight: size * 0.36,
          }}
          className="font-bold"
        >
          {initials}
        </AppText>
      )}
    </View>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "?";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}
