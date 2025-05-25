import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { FacturaType } from "../types/facturas";

export const InfoProductos = ({ facturas }: { facturas: FacturaType[] }) => {
  const [visible, setVisible] = useState(false);

  const [cantidadesProductos, setCantidadesProductos] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    setCantidadesProductos(() => {
      const cantidades: { [key: string]: number } = {};

      facturas.map((fac) =>
        fac.productos.map((p) => {
          if (cantidades[p.nombre]) {
            cantidades[p.nombre] += p.cantidad;
          } else {
            cantidades[p.nombre] = p.cantidad;
          }
        })
      );

      return cantidades;
    });
  }, [facturas]);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        className="border-zinc-800 border w-72 mx-auto mt-2 py-2 rounded-sm"
      >
        <Text className="text-center text-lg text-zinc-800">
          Ver reporte de productos
        </Text>
      </Pressable>
      <Modal animationType="slide" visible={visible}>
        <Pressable
          className="absolute right-0 top-0 m-4 z-20"
          onPress={() => setVisible(false)}
        >
          <AntDesign name="close" size={30} color="#27272a" />
        </Pressable>
        <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
          Reporte de productos
        </Text>
        {Object.entries(cantidadesProductos).length === 0 ? (
          <Text className="text-center text-lg py-4 font-semibold text-zinc-800">
            No hay productos vendidos
          </Text>
        ) : (
          <>
            <View className="px-12 flex flex-row justify-between">
              <Text className="text-lg text-zinc-800 font-semibold">
                Producto
              </Text>
              <Text className="text-lg text-zinc-800 font-semibold">
                Cantidad
              </Text>
            </View>
            <ScrollView
              className="mt-4"
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={true}
              automaticallyAdjustContentInsets={true}
            >
              {Object.entries(cantidadesProductos).map(
                ([producto, cantidad]) => (
                  <View
                    className="px-12 flex flex-row justify-between"
                    key={producto}
                  >
                    <Text className="text-lg text-zinc-800">{producto}</Text>
                    <Text className="text-lg text-zinc-800">{cantidad}</Text>
                  </View>
                )
              )}
            </ScrollView>
          </>
        )}
      </Modal>
    </>
  );
};
