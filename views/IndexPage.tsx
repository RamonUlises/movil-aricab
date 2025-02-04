import { AntDesign } from "@expo/vector-icons";
import {
  SafeAreaView,
  Platform,
  View,
  Alert,
  Image,
  Pressable,
  Text,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { useFacturas } from "../providers/FacturasProvider";

export const IndexPage = ({ logout }: { logout: () => Promise<void> }) => {
  const router = useRouter();
  const { usuario } = useAuth();
  const { facturas } = useFacturas();

  const [facturasHoy, setFacturasHoy] = useState(() => {
    const hoy = new Date();
    return facturas.filter(
      (f) =>
        new Date(f.fecha).getDate() === hoy.getDate() &&
        new Date(f.fecha).getMonth() === hoy.getMonth() &&
        new Date(f.fecha).getFullYear() === hoy.getFullYear()
    );
  });

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    setFacturasHoy(
      facturas.filter(
        (f) =>
          new Date(f.fecha).getDate() === hoy.getDate() &&
          new Date(f.fecha).getMonth() === hoy.getMonth() &&
          new Date(f.fecha).getFullYear() === hoy.getFullYear()
      )
    );
  }, [facturas]);

  async function handleLogout() {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          onPress: () => setConfirmed(false),
          style: "cancel",
        },
        {
          text: "Cerrar",
          onPress: () => setConfirmed(true),
        },
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    if (confirmed) {
      logout();
    }
  }, [confirmed, logout]);

  return (
    <SafeAreaView
      className={`flex w-full h-full p-2 bg-slate-200 ${
        Platform.OS === "android" && "pt-6"
      }`}
    >
      <View className="flex flex-row items-center justify-between px-5 mt-4">
        <View className="w-14 h-14 flex items-center justify-center">
          <Image
            source={require("../assets/icon-sf.png")}
            className="w-[100%] h-[100%] object-cover"
          />
        </View>
        <AntDesign
          onPress={handleLogout}
          size={25}
          name="logout"
          color={"red"}
        />
      </View>
      <Text className="text-xl font-bold text-center mt-4">
        Ruta: {usuario}
      </Text>
      <View className="w-full flex flex-row px-2 gap-2 mt-4">
        <View className="w-1/2 h-48 bg-green-600 rounded-md flex flex-col items-center justify-center">
          <Text className="text-center text-lg font-bold text-white">
            Facturas contado:
          </Text>
          <Text className="text-center text-base font-semibold text-white">
            {facturasHoy.filter((f) => f.tipo === "contado").length}
          </Text>
          <Text className="text-center text-lg font-bold text-white">
            Facturas crédito:
          </Text>
          <Text className="text-center text-base font-semibold text-white">
            {facturasHoy.filter((f) => f.tipo === "crédito").length}
          </Text>
          <Text className="text-center text-lg font-bold text-white">
            Facturas total:
          </Text>
          <Text className="text-center text-base font-semibold text-white">
            {facturasHoy.length}
          </Text>
        </View>
        <View className="w-1/2 h-48 border-green-600 border-2 rounded-md flex flex-col items-center justify-center">
          <Text className="text-center text-lg font-bold text-green-600">
            Total contado:
          </Text>
          <Text className="text-center text-base font-semibold text-green-600">
            C${" "}
            {facturasHoy
              .filter((f) => f.tipo === "contado")
              .reduce((acc, f) => acc + f.total, 0)}
          </Text>
          <Text className="text-center text-lg font-bold text-green-600">
            Total crédito:
          </Text>
          <Text className="text-center text-base font-semibold text-green-600">
            C${" "}
            {facturasHoy
              .filter((f) => f.tipo === "crédito")
              .reduce((acc, f) => acc + f.total, 0)}
          </Text>
          <Text className="text-center text-lg font-bold text-green-600">
            Total:
          </Text>
          <Text className="text-center text-base font-semibold text-green-600">
            C$ {facturasHoy.reduce((acc, f) => acc + f.total, 0)}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => router.push("facturar")}
        className="bg-green-600 absolute bottom-0 right-0 rounded-full w-16 h-16 m-2 items-center justify-center"
      >
        <AntDesign size={28} name="plus" color={"white"} />
      </Pressable>
    </SafeAreaView>
  );
};
