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
import { ModalOptionss } from "../components/ModalOptionss";
import { useCambios } from "../providers/CambiosProvider";
import { useDevoluciones } from "../providers/DevolucionesProvider";
import { LineChart } from "react-native-chart-kit";
import { ResumenDia } from "../components/ResumenDia";
import { Calendar } from "react-native-calendars";
import { FacturaType } from "../types/facturas";
import { server } from "../lib/server";
import { DevolucionesType } from "../types/devoluciones";
import { CambiosType } from "../types/cambios";

export const IndexPage = ({ logout }: { logout: () => Promise<void> }) => {
  const { usuario, token } = useAuth();
  const { facturas, facturasPasadas } = useFacturas();
  const { cambios } = useCambios();
  const { devoluciones } = useDevoluciones();

  const [confirmed, setConfirmed] = useState(false);
  const [visible, setVisible] = useState(false);

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

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [facturasSelectedDay, setFacturasSelectedDay] = useState<FacturaType[]>(
    []
  );
  const [devolucionesSelectedDay, setDevolucionesSelectedDay] = useState<
    DevolucionesType[]
  >([]);
  const [cambiosSelectedDay, setCambiosSelectedDay] = useState<CambiosType[]>(
    []
  );

  async function getFacturasSelectDay(day: string) {
    const fecha = new Date(day);
    try {
      const response = await fetch(
        `${server.url}/facturas/resumen/${token}/fecha/${fecha}`,
        {
          headers: {
            Authorization: `Basic ${server.credetials}`,
          },
        }
      );
      const data: {
        facturas: FacturaType[];
        devoluciones: DevolucionesType[];
        cambios: CambiosType[];
      } = await response.json();

      const { facturas, devoluciones, cambios } = data;

      setFacturasSelectedDay(facturas);
      setDevolucionesSelectedDay(devoluciones);
      setCambiosSelectedDay(cambios);
    } catch {
      setFacturasSelectedDay([]);
      setDevolucionesSelectedDay([]);
      setCambiosSelectedDay([]);
    }
  }

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

        <ResumenDia
          facturas={facturas}
          devoluciones={devoluciones}
          cambios={cambios}
        />

        {/* Comparacíon del dia con el mismo dia de la semana anterior */}
        <Text className="text-2xl my-4 text-center font-bold">
          Comparación:
        </Text>

         <View className="mb-2">
          <LineChart
            data={{
              labels: ["", "Semana Pasada", "Hoy"],
              datasets: [
                {
                  data: [
                    0,
                    facturasPasadas.reduce((acc, f) => acc + f.total, 0),
                    facturas.reduce((acc, f) => acc + f.total, 0),
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

        {/* RESUMEN DE OTRO DIA */}

        <View className="mx-4 mt-8">
          <Calendar
            className="bg-slate-100"
            onDayPress={(day: { dateString: string }) => {
              setSelectedDay(day.dateString);
              getFacturasSelectDay(day.dateString);
            }}
            enableSwipeMonths={true}
            markedDates={{
              ...(selectedDay
                ? {
                    [selectedDay]: {
                      selected: true,
                      marked: true,
                      selectedColor: "green",
                    },
                  }
                : {}),
            }}
          />
        </View>

        {selectedDay && (
          <>
            <Text className="text-2xl text-slate-800 text-center font-bold mt-8">
              Resumen del día: {selectedDay}
            </Text>
            <ResumenDia
              facturas={facturasSelectedDay}
              devoluciones={devolucionesSelectedDay}
              cambios={cambiosSelectedDay}
            />
          </>
        )}

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
