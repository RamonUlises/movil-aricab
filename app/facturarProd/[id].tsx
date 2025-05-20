import { Pressable, SafeAreaView, ScrollView, TextInput } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import { Platform } from "react-native";
import { useProductos } from "../../providers/ProductosProvider";
import { useState } from "react";
import { PrdSlc } from "../../types/productosSeleccionados";

export default function FacturarId() {
  const router = useRouter();
  const { id, prod, edit, idFacture, fechaFacture, cantidades } =
    useLocalSearchParams() as {
      id: string;
      prod: string;
      edit?: string;
      idFacture?: string;
      fechaFacture?: string;
      cantidades?: string;
    };
  const { productos } = useProductos();

  const cant: { [key: string]: number } = cantidades
    ? JSON.parse(cantidades)
    : {};

  const [prdMost, setPrdMost] = useState(productos);
  const [prodSelected, setProdSelected] = useState<PrdSlc[]>(
    prod ? JSON.parse(prod) : []
  );
  const [tempValues, setTempValues] = useState<{
    [key: string]: string | undefined;
  }>(
    prod
      ? () => {
          const prd: PrdSlc[] = JSON.parse(prod);
          const tempValues: { [key: string]: string | undefined } = {};

          prd.forEach((pr) => {
            tempValues[pr.id] = pr.cantidad.toString();
          });

          return tempValues;
        }
      : {}
  );
  const [search, setSearch] = useState("");

  const addProd = (
    id: string,
    nombre: string,
    precio: number,
    cantidadPrd: number
  ) => {
    if (prodSelected.find((prod) => prod.id === id)) return;
    const canti = cant[id] || 0;
    if (cantidadPrd + canti === 0) return;

    setProdSelected([...prodSelected, { id, nombre, precio, cantidad: 1 }]);
    setTempValues((prev) => ({ ...prev, [id]: "1" }));
  };

  const updateCantidad = (id: string) => {
    if (tempValues[id] === undefined) return;

    const cantidad = parseFloat(tempValues[id]) || 0;

    if (cantidad === 0) {
      setProdSelected(prodSelected.filter((prod) => prod.id !== id));
      return;
    }

    setProdSelected(
      prodSelected.map((prod) =>
        prod.id === id ? { ...prod, cantidad } : prod
      )
    );
  };

  const handleChange = (id: string, cantidad: string, cantidadProd: number) => {
    const canti = cant[id] || 0;
    if (cantidadProd + canti < parseFloat(cantidad)) return;

    setTempValues((prev) => ({ ...prev, [id]: cantidad }));
  };

  const minusHandle = (id: string) => {
    const tempValue = tempValues[id];
    const cantidad = parseInt(tempValue || "0", 10) - 1;

    if (cantidad <= 0) {
      setProdSelected(prodSelected.filter((prod) => prod.id !== id));
      return;
    }

    setProdSelected((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, cantidad } : prod))
    );
    setTempValues((prev) => ({ ...prev, [id]: cantidad.toString() }));
  };

  const plusHandle = (id: string, cantidadProd: number) => {
    const tempValue = tempValues[id];
    const canti = cant[id] || 0;

    if (!tempValue) return;
    const cantidad = parseFloat(tempValue) + 1;

    if (cantidad > cantidadProd + canti) return;

    setProdSelected((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, cantidad } : prod))
    );
    setTempValues((prev) => ({ ...prev, [id]: cantidad.toString() }));
  };

  const handleSearch = (text: string) => {
    if (text === "") {
      setPrdMost(productos);
    } else {
      const filtered = productos.filter((prd) =>
        prd.nombre.toLowerCase().includes(text.toLowerCase())
      );

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
              router.push("/(drawer)/facturas");
            } else {
              router.push({
                pathname: "/facturar",
                params: { mode: "facturar" },
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
          const tempValue = tempValues[producto.id];
          const cantidad = cant[producto.id] || 0;
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
                <Text className="text-[12px] text-zinc-800">
                  cantidad: {producto.cantidad + cantidad}
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
                    value={
                      tempValue !== undefined
                        ? tempValue
                        : prod.cantidad.toString()
                    }
                    className="bg-white text-black h-6 p-0 w-8 text-center my-1 mx-1"
                    onChangeText={(text) =>
                      handleChange(producto.id, text, producto.cantidad)
                    }
                    onBlur={(e) => updateCantidad(producto.id)}
                  />
                  <Pressable
                    onPress={() => plusHandle(prod.id, producto.cantidad)}
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
                      producto.cantidad
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
        <View className="w-[60%]">
          <Text className="text-base font-semibold text-zinc-800">
            Productos: {prodSelected.length}
          </Text>
          <Text className="text-base font-semibold text-zinc-800">
            Total: C${" "}
            {Math.ceil(prodSelected.reduce(
              (acc, prod) => acc + prod.precio * prod.cantidad,
              0
            ))}
          </Text>
        </View>
        <View className="w-[40%] h-full items-center justify-center">
          <Pressable
            disabled={prodSelected.length === 0}
            onPress={() =>
              router.push({
                pathname: `/facturarGuard/${id}`,
                params: {
                  prod: JSON.stringify(prodSelected),
                  edit,
                  idFacture,
                  fechaFacture,
                  cantidades,
                },
              })
            }
            className="bg-green-600 py-2 px-4 rounded-md"
          >
            <Text className="text-base font-semibold text-slate-200">
              Facturar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
