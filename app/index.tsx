import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
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
    <View className="bg-slate-200 w-full h-full justify-center items-center flex flex-row gap-2">
      <ActivityIndicator size="large" />
      <Text className="text-center text-md font-bold">Cargando datos</Text>
    </View>
  );
}
