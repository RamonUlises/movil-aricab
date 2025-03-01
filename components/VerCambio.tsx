import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { CambiosType } from "../types/cambios";
import { modalVisible } from "./ModalCambioInfo";

export const VerCambio = ({
  cambio,
  visible,
  setVisible,
}: {
  cambio: CambiosType;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<modalVisible>>;
}) => {
  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <Pressable
        onPress={() => setVisible(null)}
        className="flex w-screen h-screen bg-black/50 justify-center items-center"
      >
        <View className="bg-white w-11/12 h-5/6 rounded-md px-3 py-2 relative">
          <Pressable
            onPress={() => setVisible(null)}
            className="absolute top-2 right-2 w-8"
          >
            <AntDesign name="close" size={28} color="#27272a" />
          </Pressable>
          <Text className="text-center font-bold text-xl">Ari-Cab</Text>
          <Text className="text-center font-semibold">
            cliente: {cambio.nombre}
          </Text>
          <Text className="text-center font-semibold">
            Fecha: {new Date(cambio.fecha).toLocaleDateString()}
          </Text>
          <Text className="text-center font-semibold mt-4 text-xl">
            Producto mal estado
          </Text>
          <View className="flex flex-row justify-between items-center mt-4">
            <Text className="font-semibold text-base">Producto</Text>
            <Text className="font-semibold text-base">Cantidad</Text>
          </View>
          <ScrollView
            className="mt-2"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
            automaticallyAdjustContentInsets={true}
          >
            {
              cambio.productos.map((producto) => (
                <View
                  key={producto.id}
                  className="flex flex-row justify-between items-center mx-1 rounded-md"
                >
                  <View>
                    <Text className="text-base m-0 p-0 text-zinc-800">
                      {producto.nombre}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-base m-0 p-0 text-zinc-800">
                      {producto.cantidad}
                    </Text>
                  </View>
                </View>
              ))
            }
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};
