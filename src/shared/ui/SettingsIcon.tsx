import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

export type IconType =
  | {
      familyIcon: "ionicons";
      nameIcon: keyof typeof Ionicons.glyphMap;
    }
  | {
      familyIcon: "feather";
      nameIcon: keyof typeof Feather.glyphMap;
    }
  | {
      familyIcon: "materialCommunityIcons";
      nameIcon: keyof typeof MaterialCommunityIcons.glyphMap;
    }
  | {
      familyIcon: "antDesign";
      nameIcon: keyof typeof AntDesign.glyphMap;
    }
  | {
      familyIcon: "materialIcons";
      nameIcon: keyof typeof MaterialIcons.glyphMap;
    };

type IconProps = {
  size?: number;
  color?: string;
} & IconType;

export function SettingsIcon({
  familyIcon,
  nameIcon,
  size = 15,
  color = "#d1d5db",
}: IconProps) {
  switch (familyIcon) {
    case "ionicons":
      return <Ionicons name={nameIcon} size={size} color={color} />;

    case "feather":
      return <Feather name={nameIcon} size={size} color={color} />;

    case "materialCommunityIcons":
      return (
        <MaterialCommunityIcons name={nameIcon} size={size} color={color} />
      );

    case "antDesign":
      return <AntDesign name={nameIcon} size={size} color={color} />;

    case "materialIcons":
      return <MaterialIcons name={nameIcon} size={size} color={color} />;

    default:
      return null;
  }
}
