import { Platform, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useProductos } from "../providers/ProductosProvider";
import { useEffect, useState } from "react";

export const ProductosPage = () => {
  const { productos } = useProductos();

  const [search, setSearch] = useState("");
  const [productosSelected, setProductosSelected] = useState(productos);

  function handleSearch(text: string) {
    setSearch(text);
    if (text === "") {
      setProductosSelected(productos);
      return;
    }
    const result = productos.filter((prd) =>
      prd.nombre.toLowerCase().includes(text.toLowerCase())
    );
    
    setProductosSelected(result);
  }

  useEffect(() => {
    setProductosSelected(productos);
  }, [productos]);

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Productos
      </Text>
      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Buscar producto"
        placeholderTextColor="black"
        className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4 mx-auto"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
        className="mt-4"
      >
        {productosSelected.length === 0 && (
          <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
            No hay productos
          </Text>
        )}
        {productosSelected.map((producto) => (
          <View
            className="flex flex-row justify-between items-center px-4 py-3 mx-1 my-[0.8px] border-t-[0.5px]"
            key={producto.id}
          >
            <View>
              <Text className="text-base font-medium m-0 p-0 text-zinc-800">
                {producto.nombre}
              </Text>
              <Text className="text-[10px] -mt-1 text-zinc-800">
                cantidad: {producto.cantidad}
              </Text>
            </View>
            <View>
              <Text className="text-[14px] font-medium text-zinc-800">
                C$ {producto.precio}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
