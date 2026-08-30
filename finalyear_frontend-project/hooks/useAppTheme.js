import {useSettings} from "../app/contexts/settingsContext";

export default function useAppTheme() {
  const { themeColors, settings } = useSettings();

  return {
    colors: themeColors,
    darkMode: settings.darkMode,
  };
}
