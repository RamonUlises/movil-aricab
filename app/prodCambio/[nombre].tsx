import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useProductos } from "../../providers/ProductosProvider";
import { useEffect, useState } from "react";
import { Ionicons, AntDesign } from "@expo/vector-icons";

export default function ProdCambio() {
  const { nombre, prod, edit, cantidades, idFact, fechaFac } = useLocalSearchParams() as {
    nombre: string;
    prod?: string;
    edit?: string;
    cantidades?: string;
    fechaFac?: string;
    idFact?: string;
  };
  const { productos } = useProductos();

  const router = useRouter();

  const [search, setSearch] = useState("");
  const [prdMost, setPrdMost] = useState(productos);
  const [prodSelected, setProdSelected] = useState<{
    [key: string]: { nombre: string; cantidad: number };
  }>(() => {
    if (prod) return JSON.parse(prod);
    return {};
  });

  const cant: { [key: string]: number } = cantidades ? JSON.parse(cantidades) : {};

  function handleSearch(text: string) {
    setSearch(text);

    if (text === "") {
      setPrdMost(productos);
      return;
    }

    const filtered = productos.filter((prd) =>
      prd.nombre.toLowerCase().includes(text.toLowerCase())
    );

    setPrdMost(filtered);
  }

  const addProd = (id: string, nombre: string, cantidadPrd: number) => {
    if (cantidadPrd === 0) return;
    if (prodSelected[id]) return;
    setProdSelected({ ...prodSelected, [id]: { nombre, cantidad: 1 } });
  };

  const plusHandle = (id: string, cantidad: number) => {
    const prd = prodSelected[id];

    if (prd.cantidad + 1 > cantidad) return;

    setProdSelected({
      ...prodSelected,
      [id]: { ...prd, cantidad: prd.cantidad + 1 },
    });
  };

  const minusHandle = (id: string) => {
    const prd = prodSelected[id];

    if (prd.cantidad - 1 === 0) {
      const { [id]: _, ...rest } = prodSelected;
      setProdSelected(rest);
      return;
    }

    setProdSelected({
      ...prodSelected,
      [id]: { ...prd, cantidad: prd.cantidad - 1 },
    });
  };

  const handleChange = (id: string, text: string, cantidad: number) => {
    if (isNaN(parseInt(text))) return;
    if (parseInt(text) > cantidad) return;
    setProdSelected({
      ...prodSelected,
      [id]: { ...prodSelected[id], cantidad: parseInt(text) },
    });
  };

  useEffect(() => {
    setPrdMost(productos);
  }, [productos]);

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <View className="justify-between items-center flex-row mt-3 ml-3 z-20 mb-6">
        <Ionicons
          onPress={() => {
            router.push({
              pathname: edit ? "(drawer)/cambios" : "/facturar",
              params: { mode: "cambio" },
            });
          }}
          name="arrow-back-outline"
          size={34}
          color="#27272a"
        />
      </View>
      <Text className="text-center text-xl py-4 font-semibold text-zinc-800 absolute mt-6 w-full">
        Seleccionar productos
      </Text>
      <View className="flex flex-row justify-between items-center px-4 mx-1 mb-4">
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Buscar producto"
          placeholderTextColor="black"
          className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4 mx-auto"
        />
        <Pressable onPress={() => handleSearch("")} className="mx-1">
          <AntDesign name="close" size={24} color="#27272a" />
        </Pressable>
      </View>

      {prdMost.length === 0 && (
        <Text className="text-center text-xl py-4 font-semibold text-zinc-800 mt-6 w-full">
          No hay productos
        </Text>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
      >
        {prdMost.map((producto) => {
          const cantid = cant[producto.id] || 0;
          return (
            <View
              className="flex flex-row justify-between items-center px-4 py-3 mx-1 border-y-[0.5px] rounded-md"
              key={producto.id}
            >
              <View>
                <Text className="text-[15px] font-medium m-0 p-0 text-zinc-800">
                  {producto.nombre}
                </Text>
                <Text className="text-[12px] text-zinc-800">
                  cantidad: {producto.cantidad + cantid}
                </Text>
              </View>
              {prodSelected[producto.id] &&
              prodSelected[producto.id].cantidad > 0 ? (
                <View className="flex flex-row bg-green-500 rounded-md items-center">
                  <Pressable
                    onPress={() => minusHandle(producto.id)}
                    className="px-1"
                  >
                    <AntDesign name="minus" size={20} color="white" />
                  </Pressable>
                  <TextInput
                    editable={false}
                    keyboardType="numeric"
                    value={prodSelected[producto.id].cantidad.toString()}
                    className="bg-white text-black h-6 p-0 w-8 text-center my-1 mx-1"
                    onChangeText={(text) =>
                      handleChange(producto.id, text, producto.cantidad + cantid)
                    }
                  />
                  <Pressable
                    onPress={() => plusHandle(producto.id, producto.cantidad + cantid)}
                    className="px-1"
                  >
                    <AntDesign name="plus" size={20} color="white" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() =>
                    addProd(producto.id, producto.nombre, producto.cantidad + cantid)
                  }
                  className="bg-slate-500 py-1 px-2 rounded-md"
                >
                  <Text className="text-[14px] font-medium text-slate-200">
                    Agregar
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
      <View className="w-full h-20 px-3 flex flex-row justify-center items-center">
        <View className="w-[40%] h-full items-center justify-center">
          <Pressable
            disabled={Object.keys(prodSelected).length === 0}
            onPress={() =>
              router.push({
                pathname: `/reporteCambio/${nombre}`,
                params: {
                  prod: JSON.stringify(prodSelected),
                  edit,
                  cantidades,
                  fechaFac,
                  idFact,
                },
              })
            }
            className="bg-green-600 py-2 px-4 rounded-md"
          >
            <Text className="text-base font-semibold text-slate-200">
              Cambiar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
