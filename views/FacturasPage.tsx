import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SceneMap,
  TabBar,
  SceneRendererProps,
  NavigationState,
  TabView,
} from "react-native-tab-view";
import { Facturas } from "../components/Facturas";
import { useFacturas } from "../providers/FacturasProvider";
import { FacturaType } from "../types/facturas";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../providers/AuthProvider";
import { server } from "../lib/server";

interface Route {
  key: string;
  title: string;
}

interface State extends NavigationState<Route> {}

const renderScene = (facturas: FacturaType[]) =>
  SceneMap({
    first: () => <Facturas facturas={facturas} />,
    second: () => (
      <Facturas
        facturas={facturas.filter(
          (factura) =>
            factura.tipo === "contado" || factura.pagado === factura.total
        )}
      />
    ),
    three: () => (
      <Facturas
        facturas={facturas.filter(
          (factura) =>
            factura.tipo === "crédito" && factura.pagado < factura.total
        )}
      />
    ),
  });

export function FacturasPage() {
  const { facturas } = useFacturas();
  const { token } = useAuth();

  const layout = useWindowDimensions();

  const [facturasSelected, setFacturasSelected] =
    useState<FacturaType[]>(facturas);
  const [search, setSearch] = useState("");

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Todas" },
    { key: "second", title: "Pagado" },
    { key: "three", title: "No pagado" },
  ]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filter, setFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === "") {
      setFacturasSelected(facturas);
      return;
    }
    const resulst = facturas.filter((fac) =>
      fac.nombre.toLowerCase().includes(text.toLowerCase())
    );
    setFacturasSelected(resulst);
  };

  useEffect(() => {
    setFacturasSelected(facturas);
  }, [facturas]);

  async function getFacturasSelectDay(day: string) {
    setLoading(true);
    setFilter(false);
    try {
      const fecha = new Date(day);

      const response = await fetch(
        `${server.url}/facturas/rutas/${token}/fecha/${fecha}`,
        {
          headers: {
            Authorization: `Basic ${server.credetials}`,
          },
        }
      );
      const data: FacturaType[] = await response.json();

      Array.isArray(data) ? setFacturasSelected(data) : setFacturasSelected([]);
      setLoading(false);
    } catch {
      setFacturasSelected([]);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Facturas {selectedDay ? `del ${selectedDay}` : "hoy"}
      </Text>
      <View className="flex flex-row items-center justify-between px-3">
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Buscar factura por cliente"
          placeholderTextColor="black"
          className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4"
        />
        <Pressable
          onPress={() => setFilter(true)}
          className="bg-green-600 m-2 items-center justify-center px-2 py-1 rounded"
        >
          <Text className="text-center text-lg font-semibold text-white">
            filtrar
          </Text>
        </Pressable>
      </View>
      {selectedDay && (
        <View className="flex items-center justify-center">
          <Pressable
            onPress={() => {
              setSelectedDay(null);
              setFacturasSelected(facturas);
            }}
            className="bg-red-600 w-40 mx-auto m-2 items-center justify-center px-2 py-1 rounded"
          >
            <Text className="text-center text-sm font-semibold text-white">
              Limpiar filtro
            </Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View className="bg-slate-200 w-full h-full justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene(facturasSelected)}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      )}
      <Modal transparent={true} animationType="slide" visible={filter}>
        <Pressable onPress={() => {
          setFilter(false);
        }} className="flex w-full h-full bg-black/50 justify-center items-center">
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
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const renderTabBar = (
  props: SceneRendererProps & { navigationState: State }
) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: "#22c55e" }}
    style={{ backgroundColor: "#e2e8f0" }}
    activeColor="#22c55e"
    inactiveColor="black"
  />
);
