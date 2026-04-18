import { AppText } from "@/src/shared/ui/AppText";
import { Pressable, View } from "react-native";

export enum HubTab {
  Active = "Active",
  Archived = "Archived",
}

const tabs = Object.values(HubTab);

export function MyHubTabs({
  activTab,
  activeLength,
  archivedLength,
  onSetTab,
}: {
  activTab: HubTab;
  activeLength: number;
  archivedLength: number;
  onSetTab: (tab: HubTab) => void;
}) {
  const lengths = {
    [HubTab.Active]: activeLength,
    [HubTab.Archived]: archivedLength,
  };
  return (
    <View className="flex-row rounded-[14px] border border-white/5 bg-white/5 p-1">
      {tabs.map((tab, index) => {
        return (
          <Pressable
            key={`${tab}-${index}`}
            onPress={() => onSetTab(tab)}
            className={`flex-1 rounded-[11px] px-4 py-3 ${
              activTab === tab ? "bg-white/10" : ""
            }`}
          >
            <View className="flex flex-row justify-center items-center">
              <AppText
                className={`font-semibold ${
                  activTab === tab ? "text-neutral-300" : "text-neutral-400"
                }`}
              >
                {tab}
              </AppText>
              {lengths[tab] ? (
                <AppText className="flex font-extrabold -mt-1 ml-1 text-sm text-gray-400">
                  {lengths[tab]}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
