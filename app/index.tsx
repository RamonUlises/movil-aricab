import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { LogBox, Alert } from 'react-native';

LogBox.ignoreLogs(['...']);

if(__DEV__) {
  LogBox.ignoreLogs(['...']);
} else {
  Alert.alert("Error critico", "Ocurrio un error critico en la aplicacion, por favor contacte al administrador");
}

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
  )
}
