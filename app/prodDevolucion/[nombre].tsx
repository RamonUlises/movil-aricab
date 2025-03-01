import { Pressable, SafeAreaView, ScrollView, TextInput } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import { Platform } from "react-native";
import { useProductos } from "../../providers/ProductosProvider";
import { useState } from "react";
import { PrdSlc } from "../../types/productosSeleccionados";
import { buscarProductos } from "../../utils/buscarProductos";
import { ProductosDevolucion } from "../../types/devoluciones";

export default function FacturarId() {
  const router = useRouter();
  const { nombre, prod, edit, idFac, fechaFac } =
    useLocalSearchParams() as {
      nombre: string;
      prod: string;
      edit?: string;
      idFac?: string;
      fechaFac?: string;
    };
  const { productos } = useProductos();

  const [prdMost, setPrdMost] = useState(productos);
  const [prodSelected, setProdSelected] = useState<ProductosDevolucion[]>(
    prod ? JSON.parse(prod) : []
  );

  const [search, setSearch] = useState("");

  const addProd = (
    id: string,
    nombre: string,
    precio: number,
  ) => {
    setProdSelected((prev) => [...prev, { id, nombre, precio, cantidad: 1 }]);
  };

  const minusHandle = (id: string) => {
    setProdSelected((prev) => {
      const prod = prev.find((prod) => prod.id === id);
      if (prod && prod.cantidad > 1) {
        return prev.map((prod) =>
          prod.id === id ? { ...prod, cantidad: prod.cantidad - 1 } : prod
        );
      } else {
        return prev.filter((prod) => prod.id !== id);
      }
    });
  };

  const plusHandle = (id: string) => {
    setProdSelected((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, cantidad: prod.cantidad + 1 } : prod
      )
    );
  };

  const handleSearch = (text: string) => {
    if (text === "") {
      setPrdMost(productos);
    } else {
      const filtered = buscarProductos(text, productos);

      setPrdMost(filtered);
    }

    setSearch(text);
  };

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <View className="justify-between items-center flex-row mt-3 ml-3 z-20 mb-6">
        <Ionicons
          onPress={() => {
            if (edit) {
              router.push("/(drawer)/devoluciones");
            } else {
              router.push({
                pathname: "/facturar",
                params: { mode: "devolucion" },
              });
            }
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
          const prod = prodSelected.find((prod) => prod.id === producto.id);
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
                  precio: C$ {producto.precio}
                </Text>
              </View>
              {prod && prod.cantidad > 0 ? (
                <View className="flex flex-row bg-green-500 rounded-md items-center">
                  <Pressable
                    onPress={() => minusHandle(prod.id)}
                    className="px-1"
                  >
                    <AntDesign name="minus" size={20} color="white" />
                  </Pressable>
                  <TextInput
                    keyboardType="numeric"
                    editable={false}
                    value={prod.cantidad.toString()}
                    className="bg-white text-black h-6 p-0 w-8 text-center my-1 mx-1"
                  />
                  <Pressable
                    onPress={() => plusHandle(prod.id)}
                    className="px-1"
                  >
                    <AntDesign name="plus" size={20} color="white" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() =>
                    addProd(
                      producto.id,
                      producto.nombre,
                      producto.precio,
                    )
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
        <View className="w-full h-full items-center justify-center">
          <Pressable
            disabled={prodSelected.length === 0}
            onPress={() =>
              router.push({
                pathname: `/reporteDevolucion/${nombre}`,
                params: {
                  prod: JSON.stringify(prodSelected),
                  edit,
                  idFac,
                  fechaFac,
                },
              })
            }
            className="bg-green-600 py-2 px-4 rounded-md"
          >
            <Text className="text-base font-semibold text-slate-200">
              Devolución
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
