import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { FacturaType } from "../types/facturas";
import { useState } from "react";
import { AbonarFactura } from "./AbonarFactura";
import { useRouter } from "expo-router";
import { PrdSlc } from "../types/productosSeleccionados";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Impresoras } from "./Impresoras";
import { VerFactura } from "./VerFactura";
import { createPdf } from "../utils/createPdf";
import { useClientes } from "../providers/ClientesProvider";
import * as Sharing from "expo-sharing";

export type modalVisible = null | "ver" | "editar" | "abonar" | "menu";

export function Facturas({ facturas }: { facturas: FacturaType[] }) {
  const router = useRouter();
  const { clientes } = useClientes();
  
  // Agrupar facturas por fecha y hora (sin segundos) para mostrarlas en la lista, ordenar
  const facturasPorFecha = facturas.reduce(
    (acc: Record<string, FacturaType[]>, factura) => {
      const fechaKey = new Date(factura.fecha).toLocaleDateString(); // Convertir fecha a string
      if (!acc[fechaKey]) {
        acc[fechaKey] = [];
      }
      acc[fechaKey].push(factura);
      return acc;
    },
    {}
  );

  Object.keys(facturasPorFecha).forEach((fechaKey) => {
    facturasPorFecha[fechaKey].sort((a, b) => {
      const horaA = new Date(a.fecha).getTime();
      const horaB = new Date(b.fecha).getTime();
      return horaB - horaA; // Más recientes primero
    });
  });

  // Ordenar por fecha y hora, entre más reciente primero
  const fechasOrdenadas = Object.keys(facturasPorFecha).sort((a, b) => {
    const fechaA = new Date(a.split("/").reverse().join("-")).getTime(); // Formato YYYY-MM-DD
    const fechaB = new Date(b.split("/").reverse().join("-")).getTime();
    return fechaB - fechaA; // Más recientes primero
  });

  const [selectedFactura, setSelectedFactura] = useState({} as FacturaType);
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState<modalVisible>(null);
  const [visibleImpre, setVisibleImpre] = useState(false);

  return (
    <ScrollView
      className="mt-4"
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={true}
      automaticallyAdjustContentInsets={true}
    >
      {facturas.length > 0 ? (
        fechasOrdenadas.map((fecha) => (
          <View key={fecha}>
            {/* Título de la fecha */}
            <Text className="text-lg font-semibold text-zinc-800 px-4 py-2 text-center">
              {fecha}
            </Text>
            {/* Facturas de esta fecha */}
            {facturasPorFecha[fecha].map((factura, index) => {
              // Calcular la hora de la factura no usar formato de 24 horas y agregar ceros a la izquierda, usar am/pm
              const hora = new Date(factura.fecha).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Pressable
                  className="flex flex-row justify-between items-center px-4 py-4 mx-1 border-y-[0.5px]"
                  key={factura.id}
                  onPress={() => {
                    setSelectedFactura(factura);
                    setModalVisible("menu");
                    setIndex(index);
                  }}
                >
                  <View>
                    <Text className="text-base font-medium m-0 p-0 text-zinc-800">
                      {factura.nombre}
                    </Text>
                    <Text className="text-[10px] -mt-1 text-zinc-800">
                      Fecha: {new Date(factura.fecha).toLocaleDateString()}
                    </Text>
                    <Text className="text-[10px] -mt-1 text-zinc-800">
                      Hora: {hora}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-medium text-zinc-800">
                      C$ {factura.total.toFixed(2)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            <Modal
              className="flex w-screen h-screen justify-center items-center"
              transparent={true}
              visible={modalVisible === "menu"}
            >
              <Pressable
                className="w-full h-full flex justify-center absolute items-center bg-black/40"
                onPress={() => {
                  setModalVisible(null);
                  setSelectedFactura({} as FacturaType);
                }}
              />
              <View
                className="w-40 bg-white overflow-hidden z-[60] mx-auto my-auto"
              >
                <Pressable
                  className="py-4 border-b-[0.8px] flex flex-row pl-2 gap-4"
                  onPress={() => {
                    setModalVisible("ver");
                  }}
                >
                  <AntDesign name="eyeo" size={18} color="black" />
                  <Text>Ver factura</Text>
                </Pressable>
                <Pressable
                  className="py-4 border-b-[0.8px] flex flex-row pl-2 gap-4"
                  onPress={() => {
                    setVisibleImpre(true);
                  }}
                >
                  <AntDesign name="printer" size={18} color="black" />
                  <Text>Imprimir</Text>
                </Pressable>
                <Pressable
                  className="py-4 border-b-[0.8px] flex flex-row pl-2 gap-4"
                  onPress={async () => {
                    const pagadoo =
                      selectedFactura.tipo === "crédito"
                        ? selectedFactura.pagado
                        : selectedFactura.productos.reduce(
                            (acc, prod) => acc + prod.precio * prod.cantidad,
                            0
                          );

                    const response = await createPdf(
                      selectedFactura.productos,
                      selectedFactura.nombre,
                      selectedFactura.id,
                      selectedFactura.fecha,
                      selectedFactura.tipo,
                      pagadoo,
                      clientes
                    );

                    if (response === false) return;

                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(response.uri);
                    } else {
                      alert("No se puede compartir el archivo");
                      return false;
                    }
                  }}
                >
                  <AntDesign name="sharealt" size={18} color="black" />
                  <Text>Compartir</Text>
                </Pressable>
                <Pressable
                  className="py-4 border-b-[0.8px] flex flex-row pl-2 gap-4"
                  onPress={() => {
                    if (!selectedFactura.id) return;

                    const prd: PrdSlc[] = [];

                    const cantidades: { [key: string]: number } = {};

                    selectedFactura.productos.forEach((prds) => {
                      prd.push({
                        id: prds.id,
                        nombre: prds.nombre,
                        precio: prds.precio,
                        cantidad: prds.cantidad,
                      });
                      cantidades[prds.id] = prds.cantidad;
                    });

                    router.push({
                      pathname: `facturarGuard/${selectedFactura.nombre}`,
                      params: {
                        prod: JSON.stringify(prd),
                        edit: "edit",
                        idFacture: selectedFactura.id,
                        fechaFacture: selectedFactura.fecha.toString(),
                        cantidades: JSON.stringify(cantidades),
                      },
                    });
                  }}
                >
                  <AntDesign name="edit" size={18} color="black" />
                  <Text>Editar factura</Text>
                </Pressable>
                <Pressable
                  disabled={
                    !(selectedFactura.total - selectedFactura.pagado !== 0)
                  }
                  className="py-4 border-b-[0.8px] flex flex-row pl-2 gap-4"
                  onPress={() => {
                    if (!selectedFactura.id) return;
                    setModalVisible("abonar");
                  }}
                >
                  <MaterialIcons name="attach-money" size={18} color="black" />
                  <Text>Abonar a factura</Text>
                </Pressable>
              </View>
              
            </Modal>
          </View>
        ))
      ) : (
        <Text className="text-center text-xl py-4 font-semibold text-zinc-800">
          No hay facturas
        </Text>
      )}
      <AbonarFactura
        id={selectedFactura.id}
        visible={modalVisible === "abonar"}
        saldo={selectedFactura.total - selectedFactura.pagado}
        cliente={selectedFactura.nombre}
        setModalVisible={setModalVisible}
      />
      {selectedFactura.id !== undefined && (
        <VerFactura
          visible={modalVisible === "ver"}
          setVisible={setModalVisible}
          factura={selectedFactura}
        />
      )}
      <Impresoras
        pagado={selectedFactura.pagado}
        cliente={selectedFactura.nombre}
        estado={selectedFactura.tipo}
        productos={selectedFactura.productos}
        fecha={selectedFactura.fecha}
        id={selectedFactura.id}
        visible={visibleImpre}
        create={false}
        setVisible={setVisibleImpre}
      />
    </ScrollView>
  );
}
