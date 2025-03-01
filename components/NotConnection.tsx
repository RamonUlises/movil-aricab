import { SafeAreaView, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const NotConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected === null || isConnected) return null; // No mostrar si hay conexión o si aún no se ha verificado

  return (
    <SafeAreaView className="absolute top-0 left-0 right-0 bottom-0 bg-slate-200 flex justify-center items-center">
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Sin conexión a internet
      </Text>
    </SafeAreaView>
  );
};