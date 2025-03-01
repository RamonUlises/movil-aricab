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
import { useEffect, useState } from "react";
import { CambiosType } from "../types/cambios";
import { ModalCambioInfo } from "../components/ModalCambioInfo";
import { useDevoluciones } from "../providers/DevolucionesProvider";
import { DevolucionesType } from "../types/devoluciones";
import { ModalDevolucionInfo } from "../components/ModalDevolucionInfo";

export const DevolucionesPage = () => {
  const { devoluciones } = useDevoluciones();

  const [devolucionesSelected, setDevolucionesSelected] = useState(devoluciones);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState<DevolucionesType | null>(null);

  useEffect(() => {
    setDevolucionesSelected(devoluciones);
  }, [devoluciones]);

  const devolucionesPorFecha = devolucionesSelected.reduce(
      (acc: Record<string, DevolucionesType[]>, dev) => {
        const fechaKey = new Date(dev.fecha).toLocaleDateString(); // Convertir fecha a string
        if (!acc[fechaKey]) {
          acc[fechaKey] = [];
        }
        acc[fechaKey].push(dev);
        return acc;
      },
      {}
    );

    Object.keys(devolucionesPorFecha).forEach((fechaKey) => {
      devolucionesPorFecha[fechaKey].sort((a, b) => {
        const horaA = new Date(a.fecha).getTime();
        const horaB = new Date(b.fecha).getTime();
        return horaB - horaA; // Más recientes primero
      });
    });
  
    // Ordenar por fecha y hora, entre más reciente primero
    const fechasOrdenadas = Object.keys(devolucionesPorFecha).sort((a, b) => {
      const fechaA = new Date(a.split("/").reverse().join("-")).getTime(); // Formato YYYY-MM-DD
      const fechaB = new Date(b.split("/").reverse().join("-")).getTime();
      return fechaB - fechaA; // Más recientes primero
    });

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <Text className="text-center text-2xl py-4 font-semibold text-zinc-800">
        Devoluciones
      </Text>
      <TextInput
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setDevolucionesSelected(
            devoluciones.filter((dev) =>
              dev.nombre.toLowerCase().includes(text.toLowerCase())
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
        {devolucionesSelected.length === 0 ? (
          <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
            No hay devoluciones
          </Text>
        ) : (
          fechasOrdenadas.map((fecha) => (
            <View key={fecha}>
              {/* Título de la fecha */}
              <Text className="text-lg font-semibold text-zinc-800 px-4 py-2 text-center">
                {fecha}
              </Text>
              {/* Cambios de esta fecha */}
              {devolucionesPorFecha[fecha].map((dev) => {
                // Calcular la hora de la cambio no usar formato de 24 horas y agregar ceros a la izquierda, usar am/pm
                const hora = new Date(dev.fecha).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
  
                return (
                  <Pressable
                    className="flex flex-row justify-between items-center px-4 py-5 mx-1 border-y-[0.5px]"
                    key={dev.id}
                    onPress={() => {
                      setSelectedDevolucion(dev);
                      setVisible(true);
                    }}
                  >
                    <Text className="text-zinc-800">
                      {dev.nombre}
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
        selectedDevolucion && <ModalDevolucionInfo visible={visible} setVisible={setVisible} devolucion={selectedDevolucion} />
      }
    </SafeAreaView>
  );
};
