import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCambios } from "../providers/CambiosProvider";
import { useEffect, useState } from "react";
import { CambiosType } from "../types/cambios";
import { ModalCambioInfo } from "../components/ModalCambioInfo";

export const CambiosPage = () => {
  const { cambios } = useCambios();

  const [cambiosSelected, setCambiosSelected] = useState(cambios);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState<CambiosType | null>(null);

  useEffect(() => {
    setCambiosSelected(cambios);
  }, [cambios]);

  const cambiosPorFecha = cambiosSelected.reduce(
      (acc: Record<string, CambiosType[]>, cambio) => {
        const fechaKey = new Date(cambio.fecha).toLocaleDateString(); // Convertir fecha a string
        if (!acc[fechaKey]) {
          acc[fechaKey] = [];
        }
        acc[fechaKey].push(cambio);
        return acc;
      },
      {}
    );

    Object.keys(cambiosPorFecha).forEach((fechaKey) => {
      cambiosPorFecha[fechaKey].sort((a, b) => {
        const horaA = new Date(a.fecha).getTime();
        const horaB = new Date(b.fecha).getTime();
        return horaB - horaA; // Más recientes primero
      });
    });
  
    // Ordenar por fecha y hora, entre más reciente primero
    const fechasOrdenadas = Object.keys(cambiosPorFecha).sort((a, b) => {
      const fechaA = new Date(a.split("/").reverse().join("-")).getTime(); // Formato YYYY-MM-DD
      const fechaB = new Date(b.split("/").reverse().join("-")).getTime();
      return fechaB - fechaA; // Más recientes primero
    });

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Cambios
      </Text>
      <TextInput
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setCambiosSelected(
            cambios.filter((cambio) =>
              cambio.nombre.toLowerCase().includes(text.toLowerCase())
            )
          );
        }}
        placeholder="Buscar por cliente"
        placeholderTextColor="black"
        className="text-black h-8 p-0 w-3/4 rounded-md border border-zinc-500 pl-4 mx-auto"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
        className="mt-4"
      >
        {cambiosSelected.length === 0 ? (
          <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
            No hay cambios
          </Text>
        ) : (
          fechasOrdenadas.map((fecha) => (
            <View key={fecha}>
              {/* Título de la fecha */}
              <Text className="text-lg font-semibold text-zinc-800 px-4 py-2 text-center">
                {fecha}
              </Text>
              {/* Cambios de esta fecha */}
              {cambiosPorFecha[fecha].map((cambio) => {
                // Calcular la hora de la cambio no usar formato de 24 horas y agregar ceros a la izquierda, usar am/pm
                const hora = new Date(cambio.fecha).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
  
                return (
                  <Pressable
                    className="flex flex-row justify-between items-center px-4 py-5 mx-1 border-y-[0.5px]"
                    key={cambio.id}
                    onPress={() => {
                      setSelectedCambio(cambio);
                      setVisible(true);
                    }}
                  >
                    <Text className="text-zinc-800">
                      {cambio.nombre}
                    </Text>
                    <Text className="text-zinc-800">
                      {hora}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
      {
        selectedCambio && <ModalCambioInfo visible={visible} setVisible={setVisible} cambio={selectedCambio} />
      }
    </SafeAreaView>
  );
};
