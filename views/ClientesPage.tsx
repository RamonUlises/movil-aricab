import { Platform, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useClientes } from "../providers/ClientesProvider";
import { useFacturas } from "../providers/FacturasProvider";
import { useEffect, useState } from "react";
import { ClienteType } from "../types/clientes";

export function ClientesPage() {
  const { clientes } = useClientes();
  const { facturas } = useFacturas();

  const [search, setSearch] = useState("");
  const [clientesSelected, setClientesSelected] = useState<ClienteType[]>([]);

  function handleSearch(text: string) {
    setSearch(text);
    if(text === "") {
      setClientesSelected([]);
      return;
    }
    const result = clientes.filter((cliente) => cliente.nombres.toLowerCase().includes(text.toLowerCase()));
    
    setClientesSelected(result);
  }

  useEffect(() => {
    setClientesSelected([]);
  }, [clientes]);

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Clientes
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
        {clientesSelected.length === 0 ? (
          <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
            No hay clientes
          </Text>
        ) : null}
        {clientesSelected.map((cliente) => {
          // sacar el total de credito buscar por nombre de cliente y sera la suma de total - pagado de todas las facturas
          const totalCredito = facturas
            .filter((factura) => factura.nombre === cliente.nombres)
            .reduce((acc, factura) => acc + factura.total - factura.pagado, 0);

          return (
            <View
              className="flex flex-row justify-between items-center px-4 py-4 mx-1 rounded-md border-t-[0.5px]"
              key={cliente.id}
            >
              <View className="w-4/5">
                <Text className="text-[14px] font-medium m-0 p-0 text-zinc-800">
                  {cliente.nombres}
                </Text>
              </View>
              <View className="w-16">
                <Text className="text-[10px] text-start font-medium text-zinc-800">
                  Saldo:
                </Text>
                <Text className="text-[12px] font-medium text-zinc-800">
                  C$ {totalCredito}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
