import React, { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useClientes } from "../providers/ClientesProvider";
import { useFacturas } from "../providers/FacturasProvider";
import { buscarClientes } from "../utils/buscarClientes";

export default function facturar() {
  const router = useRouter();
  const { clientes } = useClientes();
  const { facturas } = useFacturas();

  const moveFacturar = (id: string) => {
    router.push({ pathname: `/facturarProd/${id}` });
  };

  const [search, setSearch] = useState("");
  const [clientesSelected, setClientesSelected] = useState(clientes);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === "") {
      setClientesSelected(clientes);
      return;
    }

    const filtered = buscarClientes(clientes, text);

    setClientesSelected(filtered);
  };

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <View className="justify-between items-center flex-row mt-3 ml-3 z-20 mb-6">
        <Ionicons
          onPress={() => router.push("(drawer)")}
          name="arrow-back-outline"
          size={34}
          color="#27272a"
        />
      </View>
      <Text className="text-center text-xl py-4 font-semibold text-zinc-800 absolute mt-6 w-full">
        Seleccionar cliente
      </Text>
      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Buscar cliente"
        placeholderTextColor="black"
        className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4 mx-auto"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
        className="mt-4"
      >
        {clientesSelected.length === 0 && (
          <Text className="text-center text-xl py-4 font-semibold text-zinc-800 absolute mt-6 w-full">
            No hay clientes
          </Text>
        )}
        {clientesSelected.map((cliente) => {
          const totalCredito = facturas
            .filter((factura) => factura.nombre === cliente.nombres)
            .reduce((acc, factura) => acc + factura.total - factura.pagado, 0);
          return (
            <Pressable
              onPress={() => moveFacturar(cliente.nombres)}
              className="flex flex-row justify-between items-center px-4 py-6 mx-1 border-y-[0.5px]"
              key={cliente.id}
            >
              <Text className="text-base font-medium m-0 p-0 text-zinc-800">
                {cliente.nombres}
              </Text>
              <Text className="text-sm font-medium text-zinc-800">
                C$ {totalCredito}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
