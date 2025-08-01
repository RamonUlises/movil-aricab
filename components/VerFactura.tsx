import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { modalVisible } from "./Facturas";
import { FacturaType } from "../types/facturas";
import { AntDesign } from "@expo/vector-icons";

export const VerFactura = ({
  visible,
  setVisible,
  factura,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<modalVisible>>;
  factura: FacturaType;
}) => {
  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          setVisible(null)}}
        className="flex w-screen h-screen bg-black/50 justify-center items-center absolute top-0 left-0 z-10"
      />
        <View className="bg-white w-11/12 h-5/6 rounded-md px-3 py-2 relative z-20 m-auto">
          <Pressable onPress={() => setVisible(null)} className="absolute top-2 right-2 w-8 z-30">
            <AntDesign name="close" size={28} color="#27272a" />
          </Pressable>
          <Text className="text-center font-bold text-xl">Ari-Cab</Text>
          <Text className="text-center font-semibold">
            cliente: {factura.nombre}
          </Text>
          <Text className="text-center font-semibold">
            Estado: {factura.tipo}
          </Text>
          <Text className="text-center font-semibold">
            Fecha: {new Date(factura.fecha).toLocaleDateString()}
          </Text>
          <View className="flex flex-row justify-between items-center mt-8">
            <Text className="font-semibold text-base">Producto</Text>
            <Text className="font-semibold text-base">Monto</Text>
          </View>
          <ScrollView
            className="mt-2"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
            automaticallyAdjustContentInsets={true}
          >
            {factura.productos.map((producto) => (
              <View
                key={producto.id}
                className="flex flex-row justify-between items-center mx-1 rounded-md"
              >
                <View>
                  <Text className="text-base font-medium m-0 p-0 text-zinc-800">
                    {producto.nombre}
                  </Text>
                  <Text className="text-[14px] -mt-1 text-zinc-800">
                    {producto.precio} x {producto.cantidad}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-medium text-zinc-800">
                    C$ {producto.precio * producto.cantidad}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View className="flex flex-row justify-between items-center">
            <Text className="font-semibold text-sm">Descuento</Text>
            <Text className="font-semibold text-sm">C$ {factura.descuento || 0}</Text>
          </View>
          <View className="flex flex-row justify-between items-center">
            <Text className="font-semibold text-sm">Gran total</Text>
            <Text className="font-semibold text-sm">C$ {factura.total}</Text>
          </View>
          <View className="flex flex-row justify-between items-center">
            <Text className="font-semibold text-sm">Pagado</Text>
            <Text className="font-semibold text-sm">C$ {factura.pagado}</Text>
          </View>
          <View className="flex flex-row justify-between items-center">
            <Text className="font-semibold text-sm">Saldo</Text>
            <Text className="font-semibold text-sm">
              C$ {factura.total - factura.pagado}
            </Text>
          </View>
        </View>
    </Modal>
  );
};
