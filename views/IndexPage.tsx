import { AntDesign } from "@expo/vector-icons";
import {
  SafeAreaView,
  Platform,
  View,
  Alert,
  Image,
  Pressable,
  Text,
  Dimensions,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useFacturas } from "../providers/FacturasProvider";
import { InfoFacturasDia } from "../components/InfoFacturasDia";
import { ModalOptionss } from "../components/ModalOptionss";
import { InfoCambios } from "../components/InfoCambios";
import { useCambios } from "../providers/CambiosProvider";
import { InfoProductos } from "../components/InfoProductos";
import { useDevoluciones } from "../providers/DevolucionesProvider";
import { BarChart, LineChart } from "react-native-chart-kit";

export const IndexPage = ({ logout }: { logout: () => Promise<void> }) => {
  const { usuario } = useAuth();
  const { facturas } = useFacturas();
  const { cambios } = useCambios();
  const { devoluciones } = useDevoluciones();

  const [facturasHoy, setFacturasHoy] = useState(() => {
    const hoy = new Date();
    return facturas.filter(
      (f) =>
        new Date(f.fecha).getDate() === hoy.getDate() &&
        new Date(f.fecha).getMonth() === hoy.getMonth() &&
        new Date(f.fecha).getFullYear() === hoy.getFullYear()
    );
  });
  const [facturasSemanaPasada] = useState(() => {
    const hoy = new Date();
    const semanaPasada = new Date(hoy);
    semanaPasada.setDate(hoy.getDate() - 8);
    return facturas.filter(
      (f) =>
        new Date(f.fecha).getDate() === semanaPasada.getDate() &&
        new Date(f.fecha).getMonth() === semanaPasada.getMonth() &&
        new Date(f.fecha).getFullYear() === semanaPasada.getFullYear()
    );
  });

  const [devolucionesHoy, setDevolucionesHoy] = useState(() => {
    return devoluciones
      .filter(
        (d) =>
          new Date(d.fecha).getDate() === new Date().getDate() &&
          new Date(d.fecha).getMonth() === new Date().getMonth() &&
          new Date(d.fecha).getFullYear() === new Date().getFullYear()
      )
      .reduce((acc, d) => acc + d.total, 0);
  });

  const [confirmed, setConfirmed] = useState(false);
  const [visible, setVisible] = useState(false);

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
    setDevolucionesHoy(
      devoluciones
        .filter(
          (d) =>
            new Date(d.fecha).getDate() === hoy.getDate() &&
            new Date(d.fecha).getMonth() === hoy.getMonth() &&
            new Date(d.fecha).getFullYear() === hoy.getFullYear()
        )
        .reduce((acc, d) => acc + d.total, 0)
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
      <View className="flex flex-row items-center justify-between px-3 mt-4">
        <View className="w-14 h-14 flex items-center justify-center">
          <Image
            source={require("../assets/icon-sf.png")}
            className="w-[100%] h-[100%] object-cover"
          />
        </View>
        <Text className="text-xl font-bold text-center">Ruta: {usuario}</Text>
        <AntDesign
          onPress={handleLogout}
          size={25}
          name="logout"
          color={"red"}
        />
      </View>

      {/* INFORMACION DEL DIA */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
      >
        <Text className="text-2xl my-4 text-slate-800 text-center font-bold">
          Resumen del día:
        </Text>
        <InfoFacturasDia facturasHoy={facturasHoy} />
        <View className="mx-auto mt-2 py-2 rounded-sm">
          <Text className="text-center text-lg text-zinc-800">
            Devolución: C$ {devolucionesHoy}
          </Text>
        </View>
        <View className="flex flex-row mb-4">
          <Text className="font-medium bg-green-600 w-1/2 text-center text-xl text-white rounded-r-xl">
            Total Neto:
          </Text>
          <Text className="font-medium text-green-600 w-1/2 -ml-2 text-center text-xl rounded-r-xl border-y border-green-600 border-r">
            C${" "}
            {facturasHoy.filter(f => f.tipo === 'contado').reduce((acc, f) => acc + f.total, 0) - devolucionesHoy}
          </Text>
        </View>

        <InfoCambios
          cambios={() => {
            return cambios.filter(
              (c) =>
                new Date(c.fecha).getDate() === new Date().getDate() &&
                new Date(c.fecha).getMonth() === new Date().getMonth() &&
                new Date(c.fecha).getFullYear() === new Date().getFullYear()
            );
          }}
        />
        <InfoProductos
          facturas={() => {
            return facturas.filter(
              (f) =>
                new Date(f.fecha).getDate() === new Date().getDate() &&
                new Date(f.fecha).getMonth() === new Date().getMonth() &&
                new Date(f.fecha).getFullYear() === new Date().getFullYear()
            );
          }}
        />
        {/* Comparacíon del dia con el mismo dia de la semana anterior */}
        <Text className="text-2xl my-4 text-center font-bold">
          Comparación:
        </Text>

        <View className="mb-20">
          <LineChart
            data={{
              labels: ["", "Semana Pasada", "Hoy"],
              datasets: [
                {
                  data: [
                    0,
                    facturasSemanaPasada.reduce((acc, f) => acc + f.total, 0),
                    facturasHoy.reduce((acc, f) => acc + f.total, 0),
                  ],
                },
              ],
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            yAxisLabel="C$"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: "#16a34a",
              backgroundGradientFrom: "#16a34a",
              backgroundGradientTo: "#22c55e",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {},
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffffff",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
            }}
          />
        </View>
        {/* MODAL OPCIONES */}

        <ModalOptionss visible={visible} setVisible={setVisible} />
      </ScrollView>
      <Pressable
        onPress={() => setVisible(true)}
        className="bg-green-600 absolute bottom-0 right-0 rounded-full w-16 h-16 m-2 items-center justify-center"
      >
        <AntDesign size={28} name="plus" color={"white"} />
      </Pressable>
    </SafeAreaView>
  );
};
