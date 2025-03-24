import { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  useWindowDimensions,
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
        facturas={facturas.filter((factura) => factura.tipo === "contado" || factura.pagado === factura.total)}
      />
    ),
    three: () => (
      <Facturas
        facturas={facturas.filter((factura) => factura.tipo === "crédito" && factura.pagado < factura.total)}
      />
    ),
  });

export function FacturasPage() {
  const { facturas } = useFacturas();

  const layout = useWindowDimensions();

  const [facturasSelected, setFacturasSelected] = useState<FacturaType[]>(facturas);
  const [search, setSearch] = useState("");

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Todas" },
    { key: "second", title: "Pagado" },
    { key: "three", title: "No pagado" },
  ]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if(text === "") {
      setFacturasSelected(facturas);
      return;
    }
    const resulst = facturas.filter(fac => fac.nombre.toLowerCase().includes(text.toLowerCase()))
    setFacturasSelected(resulst);
  };

  useEffect(() => {
    setFacturasSelected(facturas);
  }, [facturas]);

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Facturas
      </Text>
      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Buscar factura por cliente"
        placeholderTextColor="black"
        className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4 mx-auto mb-2"
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene(facturasSelected)}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
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
