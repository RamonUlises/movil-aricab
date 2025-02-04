import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";
import { modalVisible } from "./Facturas";
import { abonarFacturaServer } from "../lib/facturas";

export const AbonarFactura = ({
  cliente,
  visible,
  saldo,
  setModalVisible,
  id,
}: {
  cliente: string;
  visible: boolean;
  saldo: number;
  setModalVisible: React.Dispatch<React.SetStateAction<modalVisible>>;
  id: string;
}) => {
  const [abono, setAbono] = useState(0);
  const [loading, setLoading] = useState(false);

  async function abonarFactura() {
    if (abono === 0) return;
    setLoading(true);
    try {
      await abonarFacturaServer({ id, abono });
    } finally {
      setModalVisible(null);
    }
  }

  useEffect(() => {
    setAbono(0);
    setLoading(false);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      className="flex justify-center items-center h-screen"
    >
      <View className="flex justify-center items-center h-screen">
        <View className="bg-white py-3 rounded-md px-4  w-[80%]">
          <Text className="text-center font-bold text-lg">
            Abonar a {cliente}
          </Text>
          <Text className="mt-2">Saldo: C$ {saldo}</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Monto"
            className="border px-2 py-2 rounded mt-8 w-48 mx-auto"
            value={abono === 0 ? "" : String(abono)}
            onChangeText={(text) => {
              if (!text) return setAbono(0);
              if (isNaN(Number(text))) return;
              if (Number(text) > saldo) return;

              setAbono(Number(text));
            }}
          />
          <View className="flex flex-row justify-end gap-2 mt-4">
            <Pressable
              onPress={() => setModalVisible(null)}
              className="border border-red-600 px-2 py-1 rounded"
            >
              <Text className="text-red-600">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={abonarFactura}
              className="bg-green-600 disabled:bg-green-400 px-2 py-1 rounded"
              disabled={loading}
            >
              {
                loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Aceptar</Text>
                )
              }
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
