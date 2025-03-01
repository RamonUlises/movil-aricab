import { Modal, Pressable, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { VerCambio } from "./VerCambio";
import { useState } from "react";
import { useClientes } from "../providers/ClientesProvider";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { DevolucionesType } from "../types/devoluciones";
import { createReporteDevolucionPDF } from "../utils/createReporteDevolucionPDF";
import { ImpresorasDevolucion } from "./ImpresorasDevolucion";
import { VerDevolucion } from "./VerDevolucion";

export type modalVisible = null | "ver" | "imprimir";

export const ModalDevolucionInfo = ({
  visible,
  setVisible,
  devolucion,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  devolucion: DevolucionesType;
}) => {
  const { clientes } = useClientes();
  const [modalVisible, setModalVisible] = useState<modalVisible>(null);
  const router = useRouter();

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          onPress={() => setVisible(false)}
          className="w-full h-full flex justify-center items-center bg-black/50"
        >
          <Pressable
            onPress={() => setModalVisible("ver")}
            className="bg-white border-[0.5px] w-44 flex flex-row pl-4 py-3 items-center"
          >
            <AntDesign name="eyeo" size={18} color="black" />
            <Text className="text-center ml-3">Ver</Text>
          </Pressable>
          <Pressable
            onPress={() => setModalVisible("imprimir")}
            className="bg-white border-[0.5px] w-44 flex flex-row pl-4 py-3 items-center"
          >
            <AntDesign name="printer" size={18} color="black" />
            <Text className="text-center ml-3">Imprimir</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              const uri = await createReporteDevolucionPDF(devolucion.productos, devolucion.nombre, clientes, devolucion.id, new Date(devolucion.fecha), devolucion.total);

              if (uri) {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri);
                } else {
                  alert("No se puede compartir el archivo");
                  return false;
                }
              }
            }}
            className="bg-white border-[0.5px] w-44 flex flex-row pl-4 py-3 items-center"
          >
            <AntDesign name="sharealt" size={18} color="black" />
            <Text className="text-center ml-3">Compartir</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              router.push({
                pathname: `/reporteDevolucion/${devolucion.nombre}`,
                params: {
                  mode: "devolucion",
                  edit: "true",
                  prod: JSON.stringify(devolucion.productos),
                  fechaFac: devolucion.fecha,
                  idFac: devolucion.id,
                },
              });
            }}
            className="bg-white border-[0.5px] w-44 flex flex-row pl-4 py-3 items-center"
          >
            <AntDesign name="edit" size={18} color="black" />
            <Text className="text-center ml-3">Editar</Text>
          </Pressable>
        </Pressable>
      </Modal>
      <VerDevolucion
        visible={modalVisible === "ver"}
        setVisible={setModalVisible}
        devolucion={devolucion}
      />
      <ImpresorasDevolucion page={true} setVisible={setModalVisible} visible={modalVisible === "imprimir"} cliente={devolucion.nombre} fecha={devolucion.fecha} id={devolucion.id} productos={devolucion.productos} total={devolucion.total} />
    </>
  );
};
