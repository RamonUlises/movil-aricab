import { Modal, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

export const ModalOptionss = ({ visible, setVisible }: { visible: boolean; setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const router = useRouter();

  return (
    <Modal
      className="w-screen h-screen flex items-center justify-center"
      visible={visible}
      transparent={true}
    >
      <Pressable onPress={() => setVisible(false)} className="w-screen h-screen bg-black/50 flex items-center justify-center">
        <Pressable onPress={() => {
            setVisible(false);
            router.push({ pathname: "/facturar", params: { mode: "facturar" } });
          }} className="bg-white border-[0.5px] py-4 w-52">
          <Text className="text-center">Crear factura</Text>
        </Pressable>
        <Pressable onPress={() => {
          setVisible(false);
          router.push({ pathname: "/facturar", params: { mode: "cambio" } });
        }} className="bg-white border-[0.5px] py-4 w-52">
          <Text className="text-center">Crear reporte de cambio</Text>
        </Pressable>
        <Pressable onPress={() => {
          setVisible(false);
          router.push({ pathname: "/facturar", params: { mode: "devolucion" } });
        }} className="bg-white border-[0.5px] py-4 w-52">
          <Text className="text-center">Crear reporte de devolución</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
