import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import uuid from "react-native-uuid";
import * as Sharing from "expo-sharing";
import { useClientes } from "../../providers/ClientesProvider";
import { crearReporteCambio, editarReporteCambio } from "../../lib/Reportes";
import { createReporteCambioPDF } from "../../utils/createReporteCambioPDF";
import { ImpresorasCambio } from "../../components/ImpresorasCambio";

export default function ReporteCambio() {
  const { nombre, prod, edit, cantidades, fechaFac, idFact } = useLocalSearchParams() as {
    nombre: string;
    prod: string;
    edit?: string;
    cantidades?: string;
    fechaFac?: string;
    idFact?: string;
  };

  const { clientes } = useClientes();
  const { token } = useAuth();
  const router = useRouter();

  const fecha = fechaFac ? new Date(fechaFac) : new Date();
  const idFac = idFact ? idFact : uuid.v4();

  const productos: { [key: string]: { nombre: string; cantidad: number } } = prod ? JSON.parse(prod) : {};

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function printFacture() {
    try {
      let response: boolean = false;
      
      if(edit){
        response = await editarReporteCambio(idFac, productos);
      } else {
        response = await crearReporteCambio(idFac, nombre, token, fecha.toString(), productos);
      }

      if (response) {
        setVisible(true);
      }
    } catch {
      alert("Error al imprimir reporte");
    }
  }

  async function exportFacture() {
    try {
      let response: boolean = false;
      
      if(edit){
        response = await editarReporteCambio(idFac, productos);
      } else {
        response = await crearReporteCambio(idFac, nombre, token, fecha.toString(), productos);
      }

      if (response) {
        const uri = await createReporteCambioPDF(
          productos,
          nombre,
          clientes,
          idFac,
          fecha
        );

        if (uri) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
            router.push("(drawer)");
          } else {
            alert("No se puede compartir el archivo");
            return false;
          }
        }
      }
    } catch {
      alert("Error al exportar reporte");
    }
  }

  async function saveFacture() {
    try {
      let response: boolean = false;
      
      if(edit){
        response = await editarReporteCambio(idFac, productos);
      } else {
        response = await crearReporteCambio(idFac, nombre, token, fecha.toString(), productos);
      }

      if (response) {
        router.push("(drawer)");
      }

      setLoading(false);
    } catch {
      alert("Error al guardar reporte");
    }
  }

  return (
    <SafeAreaView
      className={`bg-slate-200 h-full ${Platform.OS === "android" && "pt-6"}`}
    >
      <View className="justify-between items-center flex-row mt-3 ml-3 z-20 mb-6">
        <Ionicons
          onPress={() =>
            router.push({
              pathname: `/prodCambio/${nombre}`,
              params: {
                prod: JSON.stringify(productos),
                edit,
                cantidades,
                fechaFac,
                idFact,
              },
            })
          }
          name="arrow-back-outline"
          size={34}
          color="#27272a"
        />
      </View>
      <Text className="text-center text-xl py-4 font-semibold text-zinc-800 absolute mt-6 w-full">
        Cambios
      </Text>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {Object.entries(productos).map(([id, prod], index) => {
            return (
              <View
                key={id}
                className={`${
                  index % 2 === 0 ? "bg-slate-100" : ""
                } flex flex-row justify-between items-center px-8 py-2`}
              >
                <Text className="text-base font-semibold text-zinc-800">
                  {prod.nombre}
                </Text>
                <View className="flex flex-col">
                  <View className="flex flex-row items-center">
                    <Text className="text-zinc-800">{prod.cantidad}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View className="bg-zinc-700 flex flex-row">
        <Pressable
          onPress={async () => {
            setLoading(true);
            await saveFacture();
          }}
          className="w-1/3 flex flex-col py-2"
          disabled={loading}
        >
          <AntDesign
            style={{ textAlign: "center" }}
            name="save"
            size={24}
            color="white"
          />
          <Text className="text-center text-sm font-semibold text-slate-200">
            Guardar
          </Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            setLoading(true);
            await exportFacture();
          }}
          className="w-1/3 flex flex-col py-2"
          disabled={loading}
        >
          <AntDesign
            style={{ textAlign: "center" }}
            name="export"
            size={24}
            color="white"
          />
          <Text className="text-center text-sm font-semibold text-slate-200">
            Exportar
          </Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            setLoading(true);
            await printFacture();
          }}
          className="w-1/3 flex flex-col py-2"
          disabled={loading}
        >
          <AntDesign
            style={{ textAlign: "center" }}
            name="printer"
            size={24}
            color="white"
          />
          <Text className="text-center text-sm font-semibold text-slate-200">
            Imprimir
          </Text>
        </Pressable>
      </View>
      <ImpresorasCambio page={false} visible={visible} cliente={nombre} fecha={fecha.toString()} id={idFac} productos={productos} />
    </SafeAreaView>
  );
}
