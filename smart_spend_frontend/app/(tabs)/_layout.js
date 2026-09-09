import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import useAppTheme from "../../hooks/useAppTheme";

export default function TabsLayout() {
  const {colors} = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#eb253f",
        tabBarInactiveTintColor: colors.subText,

        tabBarStyle: {
          height: 80,
          backgroundColor: colors.header,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="budget"
        options={{
          title: "Budgets",
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Feather name="circle" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
