import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { LogBox, Alert } from "react-native";

LogBox.ignoreLogs(["..."]);

export default function index() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("(drawer)");
    }, 500);
  }, []);

  return (
    <View className="bg-slate-200 w-full h-full justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
