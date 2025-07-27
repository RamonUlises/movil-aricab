import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useClientes } from "../providers/ClientesProvider";
import { ClienteType } from "../types/clientes";
import { useProductos } from "../providers/ProductosProvider";

interface Route {
  key: string;
  title: string;
}

interface State extends NavigationState<Route> {}
type TypeFilter = "cliente" | "fecha" | "modal" | null;

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
  const { clientes } = useClientes();
  const { facturas, fetchFacturas } = useFacturas();
  const { fetchProductos } = useProductos();
  const { token } = useAuth();

  const layout = useWindowDimensions();

  const [facturasSelected, setFacturasSelected] =
    useState<FacturaType[]>(facturas);
  const [facturasSearchSelected, setFacturasSearchSelected] =
    useState<FacturaType[]>(facturas);

  const [search, setSearch] = useState("");

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Todas" },
    { key: "second", title: "Pagado" },
    { key: "three", title: "No pagado" },
  ]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<TypeFilter>(null);
  const [loading, setLoading] = useState(false);
  const [filterSearch, setFilterSearch] = useState(false);

  const [clientesSelected, setClientesSelected] = useState<ClienteType[]>([]);
  const [clienteSearch, setClienteSearch] = useState("");

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === "") {
      setFacturasSearchSelected(facturasSelected);
      return;
    }
    const resulst = facturasSelected.filter((fac) =>
      fac.nombre.toLowerCase().includes(text.toLowerCase())
    );

    setFacturasSearchSelected(resulst);
  };

  useEffect(() => {
    setFacturasSelected(facturas);
    setFacturasSearchSelected(facturas);
    setFilterSearch(false);
    setFilter(null);
    setSearch("");
    setSelectedDay(null);
  }, [facturas]);

  async function getFacturasSelectDay(day: string) {
    setLoading(true);
    setFilter(null);
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

      if (Array.isArray(data)) {
        setFacturasSelected(data);
        setFacturasSearchSelected(data);
      } else {
        setFacturasSelected([]);
        setFacturasSearchSelected([]);
      }

      setLoading(false);
    } catch {
      setFacturasSelected([]);
      setFacturasSearchSelected([]);
      setLoading(false);
    }
  }

  const handleSearchCliente = (text: string) => {
    setClienteSearch(text);
    if (text === "") {
      setClientesSelected([]);
      return;
    }

    const filtered = [];
    const lowerText = text.toLowerCase();

    for (const cliente of clientes) {
      if (cliente.nombres.toLowerCase().includes(lowerText)) {
        filtered.push(cliente);
        if (filtered.length === 20) break; // detener al llegar a 20
      }
    }

    setClientesSelected(filtered);
  };

  async function getFacturaCliente(cliente: string) {
    setLoading(true);
    setFilter(null);
    try {
      const response = await fetch(
        `${server.url}/facturas/clientes/${cliente}/facturador/${token}`,
        {
          headers: {
            Authorization: `Basic ${server.credetials}`,
          },
        }
      );
      const data: FacturaType[] = await response.json();

      if (Array.isArray(data)) {
        setFacturasSelected(data);
        setFacturasSearchSelected(data);
      } else {
        setFacturasSelected([]);
        setFacturasSearchSelected([]);
      }

      setLoading(false);
    } catch {
      setLoading(false);
      setFacturasSelected([]);
      setFacturasSearchSelected([]);
    }
  }

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Facturas {selectedDay ? `del ${selectedDay}` : "hoy"}
      </Text>
      <Pressable onPress={
        () => {
          fetchFacturas();
          fetchProductos();         
        }
      } className="absolute bottom-4 right-4 z-20 rounded-full items-center justify-center bg-slate-300 p-3">
        <Ionicons name="reload" size={28} color="#27272a" />
      </Pressable>
      <View className="flex flex-row items-center justify-between px-3">
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Buscar factura por cliente"
          placeholderTextColor="black"
          className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4"
        />
        <Pressable
          onPress={() => setFilter("modal")}
          className="bg-green-600 m-2 items-center justify-center px-2 py-1 rounded"
        >
          <Text className="text-center text-lg font-semibold text-white">
            filtrar
          </Text>
        </Pressable>
      </View>
      {filterSearch && (
        <View className="flex items-center justify-center">
          <Pressable
            onPress={() => {
              setSelectedDay(null);
              setFacturasSelected(facturas);
              setFacturasSearchSelected(facturas);
              setFilterSearch(false);
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
          renderScene={renderScene(facturasSearchSelected)}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      )}
      <Modal
        transparent={true}
        animationType="slide"
        visible={filter === "modal"}
      >
        <Pressable
          onPress={() => {
            setFilter(null);
          }}
          className="flex w-full h-full bg-black/50 justify-center items-center"
        >
          <View className="mx-4 bg-white rounded">
            <Pressable
              onPress={() => setFilter("cliente")}
              className="px-4 py-2"
            >
              <Text className="text-center text-lg font-semibold text-black">
                Filtrar por cliente
              </Text>
            </Pressable>
            <Pressable onPress={() => setFilter("fecha")} className="px-4 py-2">
              <Text className="text-center text-lg font-semibold text-black">
                Filtrar por fecha
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={filter === "fecha"}
      >
        <Pressable
          onPress={() => {
            setFilter(null);
          }}
          className="flex w-full h-full bg-black/50 justify-center items-center"
        >
          <View className="mx-4 mt-8">
            <Calendar
              className="bg-slate-100"
              onDayPress={(day: { dateString: string }) => {
                setSelectedDay(day.dateString);
                getFacturasSelectDay(day.dateString);
                setFilterSearch(true);
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
      <Modal
        transparent={true}
        animationType="slide"
        visible={filter === "cliente"}
      >
        <Pressable
          onPress={() => {
            setFilter(null);
          }}
          className="flex w-full h-full bg-black/50 justify-center items-center"
        >
          <View className="bg-white rounded p-4 w-[90%] h-[90%]">
            <Pressable
              onPress={() => setFilter(null)}
              className="absolute top-2 right-2 w-8 z-30"
            >
              <AntDesign name="close" size={28} color="#27272a" />
            </Pressable>
            <Text className="text-center text-lg font-semibold text-black">
              Seleccionar cliente
            </Text>
            <View className="mt-4">
              <TextInput
                value={clienteSearch}
                onChangeText={handleSearchCliente}
                placeholder="Buscar cliente"
                placeholderTextColor="black"
                className="text-black h-8 w-3/4 rounded-md border border-zinc-500 mx-auto pl-4"
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={true}
              automaticallyAdjustContentInsets={true}
              className="mt-4"
            >
              {clientesSelected.length === 0 && (
                <Text className="text-center text-xl font-semibold text-zinc-800 mt-6">
                  No hay clientes
                </Text>
              )}
              {clientesSelected.map((cliente) => (
                <Pressable
                  onPress={() => {
                    getFacturaCliente(cliente.nombres);
                    setFilterSearch(true);
                  }}
                  key={cliente.id}
                  className="px-2 py-3 border-[0.5px] border-black"
                >
                  <Text className="text-base m-0 p-0 text-zinc-800">
                    {cliente.nombres}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
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
