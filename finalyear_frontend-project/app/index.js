import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/signUp" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
