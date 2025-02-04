import { Stack } from "expo-router";
import { Provider } from "../providers/Provider";

export default function RootLayout() {
  return (
    <Provider>
      <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }} />
    </Provider>
  );
}
