import { useMemo } from "react";
import { Image } from "react-native";

type Params = {
  size?: number;
  theme?: "dark" | "light";
};

export function ToqenLogo(params?: Params) {
  const { theme = "dark", size = 55 } = params || {};

  const source = useMemo(() => {
    if (theme === "dark") {
      return require("../../../assets/images/notification-icon.png");
    }
    return require("../../../assets/images/icon.png");
  }, [theme]);

  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
      }}
      resizeMode="cover"
    />
  );
}
