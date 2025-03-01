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
import { ProductosDevolucion } from "../../types/devoluciones";
import {
  crearReporteDevolucion,
  editarReporteDevolucion,
} from "../../lib/devoluciones";
import { createReporteDevolucionPDF } from "../../utils/createReporteDevolucionPDF";
import { ImpresorasDevolucion } from "../../components/ImpresorasDevolucion";

export default function FacturarId() {
  const { nombre, prod, edit, idFac, fechaFac} =
    useLocalSearchParams() as {
      nombre: string;
      prod: string;
      edit?: string;
      idFac?: string;
      fechaFac?: string;
    };

  const { clientes } = useClientes();

  const { token, admin } = useAuth();
  const fecha = fechaFac ? new Date(fechaFac) : new Date();
  const idFactu = idFac ? idFac : uuid.v4();
  const router = useRouter();

  const [productos, setProductos] = useState<ProductosDevolucion[]>(
    prod ? JSON.parse(prod) : []
  );

  const [tempValues, setTempValues] = useState<{
    [key: string]: string | undefined;
  }>({});

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (id: string, cantidad: string) => {
    setTempValues((prev) => ({ ...prev, [id]: cantidad }));
  };

  const updatePrecio = (id: string) => {
    const tempValue = tempValues[id];

    if (tempValue === "") {
      setTempValues((prev) => ({ ...prev, [id]: "0" }));
      return;
    }

    const precio = parseFloat(tempValue || "0");

    if (precio < 0) {
      // si el valor es menor a 0, dejarlo en 0
      setProductos((prev) =>
        prev.map((prod) => (prod.id === id ? { ...prod, precio: 0 } : prod))
      );
      return;
    }

    setProductos((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, precio } : prod))
    );
  };

  async function printFacture() {
    const total = productos.reduce(
      (acc, prod) => acc + prod.precio * prod.cantidad,
      0
    );
    try {
      let response: boolean;

      if (edit) {
        response = await editarReporteDevolucion(idFactu, productos, total);
      } else {
        response = await crearReporteDevolucion(
          idFactu,
          token,
          nombre,
          fecha.toString(),
          productos,
          total
        );
      }

      if (response) {
        setVisible(true);
      }
    } catch {
      alert("Error al imprimir factura");
    }
  }

  async function exportFacture() {
    const total = productos.reduce(
      (acc, prod) => acc + prod.precio * prod.cantidad,
      0
    );
    try {
      let response: boolean;

      if (edit) {
        response = await editarReporteDevolucion(idFactu, productos, total);
      } else {
        response = await crearReporteDevolucion(
          idFactu,
          token,
          nombre,
          fecha.toString(),
          productos,
          total
        );
      }

      if (response) {
        const uri = await createReporteDevolucionPDF(
          productos,
          nombre,
          clientes,
          idFactu,
          fecha,
          total
        );

        if (!uri) {
          alert("Factura no encontrada");
          return;
        }

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
          router.push("(drawer)");
        } else {
          alert("No se puede compartir el archivo");
          return false;
        }
      }
    } catch {
      alert("Error al exportar factura");
    }
  }

  async function saveFacture() {
    const total = productos.reduce(
      (acc, prod) => acc + prod.precio * prod.cantidad,
      0
    );
    try {
      let response: boolean;

      if (edit) {
        response = await editarReporteDevolucion(idFactu, productos, total);
      } else {
        response = await crearReporteDevolucion(
          idFactu,
          token,
          nombre,
          fecha.toString(),
          productos,
          total
        );
      }

      if (response) {
        router.push("(drawer)");
      }
    } catch {
      alert("Error al guardar factura");
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
              pathname: `prodDevolucion/${nombre}`,
              params: {
                prod: JSON.stringify(productos),
                edit,
                idFac,
                fechaFac,
              },
            })
          }
          name="arrow-back-outline"
          size={34}
          color="#27272a"
        />
      </View>
      <Text className="text-center text-xl py-4 font-semibold text-zinc-800 absolute mt-6 w-full">
        Facturar
      </Text>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {productos.map((prod, index) => {
            const tempValue = tempValues[prod.id];
            return (
              <View
                key={prod.id}
                className={`${
                  index % 2 === 0 ? "bg-slate-100" : ""
                } flex flex-row justify-between items-center px-8 py-2`}
              >
                <Text className="text-base font-semibold text-zinc-800">
                  {prod.nombre}
                </Text>
                <View className="flex flex-col">
                  <View className="flex flex-row items-center">
                    <Text className="text-zinc-800">C$</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={
                        tempValue !== undefined
                          ? tempValue
                          : prod.precio.toString()
                      }
                      className="bg-zinc-300 text-black mx-2 h-8 p-0 w-12 text-center border border-zinc-500"
                      onChangeText={(text) => handleChange(prod.id, text)}
                      onBlur={(e) => updatePrecio(prod.id)}
                      editable={admin}
                    />
                  </View>

                  <View>
                    <Text className="text-[10px] mt-1">
                      Cantidad: {prod.cantidad}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View>
        <Text className="text-center text-xl py-4 font-semibold text-zinc-800 mt-6 w-full">
          Total: C${" "}
          {productos.reduce(
            (acc, prod) => acc + prod.precio * prod.cantidad,
            0
          )}
        </Text>
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
      <ImpresorasDevolucion
        page={false}
        visible={visible}
        cliente={nombre}
        fecha={fecha.toString()}
        id={idFactu}
        productos={productos}
        total={productos.reduce(
          (acc, prod) => acc + prod.precio * prod.cantidad,
          0
        )}
      />
    </SafeAreaView>
  );
}
