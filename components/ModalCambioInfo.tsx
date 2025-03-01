import { Modal, Pressable, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { CambiosType } from "../types/cambios";
import { VerCambio } from "./VerCambio";
import { useState } from "react";
import { ImpresorasCambio } from "./ImpresorasCambio";
import { createReporteCambioPDF } from "../utils/createReporteCambioPDF";
import { useClientes } from "../providers/ClientesProvider";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";

export type modalVisible = null | "ver" | "imprimir";

export const ModalCambioInfo = ({
  visible,
  setVisible,
  cambio,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  cambio: CambiosType;
}) => {
  const { clientes } = useClientes();
  const [modalVisible, setModalVisible] = useState<modalVisible>(null);
  const router = useRouter();

  const [productos] = useState<{
    [key: string]: { nombre: string; cantidad: number };
  }>(() => {
    const productos: { [key: string]: { nombre: string; cantidad: number } } =
      {};

    cambio.productos.forEach((producto) => {
      if (productos[producto.id]) {
        productos[producto.id].cantidad += producto.cantidad;
      } else {
        productos[producto.id] = {
          nombre: producto.nombre,
          cantidad: producto.cantidad,
        };
      }
    });

    return productos;
  });

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
              const uri = await createReporteCambioPDF(
                productos,
                cambio.nombre,
                clientes,
                cambio.id,
                new Date(cambio.fecha)
              );

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
              const cantidades: { [key: string]: number } = {};

              cambio.productos.forEach((producto) => {
                cantidades[producto.id] = producto.cantidad;
              });

              router.push({
                pathname: `/reporteCambio/${cambio.nombre}`,
                params: {
                  mode: "cambio",
                  edit: "true",
                  prod: JSON.stringify(productos),
                  cantidades: JSON.stringify(cantidades),
                  fechaFac: cambio.fecha,
                  idFact: cambio.id,
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
      <VerCambio
        visible={modalVisible === "ver"}
        setVisible={setModalVisible}
        cambio={cambio}
      />
      <ImpresorasCambio
        page={true}
        setVisible={setModalVisible}
        visible={modalVisible === "imprimir"}
        cliente={cambio.nombre}
        fecha={cambio.fecha}
        id={cambio.id}
        productos={productos}
      />
    </>
  );
};
