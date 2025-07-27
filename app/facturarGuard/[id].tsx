import { useLocalSearchParams, useRouter } from "expo-router";
import { PrdSlc } from "../../types/productosSeleccionados";
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
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { crearFacturaServer, editarFacturaServer } from "../../lib/facturas";
import { createPdf } from "../../utils/createPdf";
import uuid from "react-native-uuid";
import * as Sharing from "expo-sharing";
import { Impresoras } from "../../components/Impresoras";
import { useClientes } from "../../providers/ClientesProvider";
import { useProductos } from "../../providers/ProductosProvider";

export default function FacturarId() {
  const { id, prod, edit, idFacture, fechaFacture, cantidades } =
    useLocalSearchParams() as {
      id: string;
      prod: string;
      edit?: string;
      idFacture?: string;
      fechaFacture?: string;
      cantidades?: string;
    };

  const { clientes } = useClientes();
  const { productos } = useProductos();

  const { token, admin } = useAuth();
  const fecha = fechaFacture ? new Date(fechaFacture) : new Date();
  const idFac = idFacture ? idFacture : uuid.v4();
  const router = useRouter();

  const [productosSele, setProductosSele] = useState<PrdSlc[]>(
    prod ? JSON.parse(prod) : []
  );

  const [estado, setEstado] = useState<"crédito" | "contado">("crédito");
  const [pagado, setPagado] = useState(0);
  const [tempValues, setTempValues] = useState<{
    [key: string]: string | undefined;
  }>({});

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (id: string, cantidad: string) => {
    setTempValues((prev) => ({ ...prev, [id]: cantidad }));
  };

  const [permission, setPermission] = useState(false);

  useEffect(() => {
    if(admin === true){
      setPermission(true)
    } else {
      setPermission(false)
    }
  }, [admin])

  const updatePrecio = (id: string) => {
    const tempValue = tempValues[id];
    setPagado(0);

    if(tempValue === "") {
      setTempValues((prev) => ({ ...prev, [id]: "0" }));
      return;
    }

    const precio = parseFloat(tempValue || "0");

    if (precio < 0) {
      // si el valor es menor a 0, dejarlo en 0
      setProductosSele((prev) =>
        prev.map((prod) => (prod.id === id ? { ...prod, precio: 0 } : prod))
      );
      return;
    }

    setProductosSele((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, precio } : prod))
    );
  };

  async function printFacture() {
    try {
      const pagadoo =
        estado === "crédito"
          ? pagado
          : productosSele.reduce(
              (acc, prod) => acc + prod.precio * prod.cantidad,
              0
            );

      let response: boolean;

      if (edit === undefined) {
        response = await crearFacturaServer({
          id: idFac,
          nombre: id,
          productos: productosSele,
          tipo: estado,
          facturador: token,
          fecha,
          pagado: Math.ceil(pagadoo),
        });
      } else {
        response = await editarFacturaServer({
          id: idFac,
          productos: productosSele,
          tipo: estado,
          pagado: Math.ceil(pagadoo),
        });
      }

      if (response) {
        setVisible(true);
      }
    } catch {
      alert("Error al imprimir factura");
    }
  }

  async function exportFacture() {
    try {
      const pagadoo =
        estado === "crédito"
          ? pagado
          : productosSele.reduce(
              (acc, prod) => acc + prod.precio * prod.cantidad,
              0
            );

      let response: boolean;

      if (edit === undefined) {
        response = await crearFacturaServer({
          id: idFac,
          nombre: id,
          productos: productosSele,
          tipo: estado,
          facturador: token,
          fecha,
          pagado: Math.ceil(pagadoo),
        });
      } else {
        response = await editarFacturaServer({
          id: idFac,
          productos: productosSele,
          tipo: estado,
          pagado: Math.ceil(pagadoo),
        });
      }

      if (response) {
        const res = await createPdf(
          productosSele,
          id,
          idFac,
          fecha,
          estado,
          Math.ceil(pagadoo),
          clientes
        );

        if (res === false) {
          alert("Factura no encontrada");
          return;
        }

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(res.uri);
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
    try {
      const pagadoo =
        estado === "crédito"
          ? pagado
          : productosSele.reduce(
              (acc, prod) => acc + prod.precio * prod.cantidad,
              0
            );

      let response: boolean;

      if (edit === undefined) {
        response = await crearFacturaServer({
          id: idFac,
          nombre: id,
          productos: productosSele,
          tipo: estado,
          facturador: token,
          fecha,
          pagado: Math.ceil(pagadoo),
        });
      } else {
        response = await editarFacturaServer({
          id: idFac,
          productos: productosSele,
          tipo: estado,
          pagado: Math.ceil(pagadoo),
        });
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
              pathname: `facturarProd/${id}`,
              params: {
                prod: JSON.stringify(productosSele),
                edit,
                idFacture,
                fechaFacture,
                cantidades,
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
          {productosSele.map((prod, index) => {
            const tempValue = tempValues[prod.id];
            return (
              <View
                key={prod.id}
                className={`${index % 2 === 0 ? "bg-slate-100" : ""} flex flex-row justify-between items-center px-8 py-2`}
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
                      editable={permission}
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
        <View
          className={`flex flex-row justify-between items-center px-4 py-2 bg-green-600`}
        >
          <Text className="font-semibold text-white">Gran total</Text>
          <Text className="font-semibold text-white">
            C${" "}
            {Math.ceil(productosSele.reduce(
              (acc, prod) => acc + prod.precio * prod.cantidad,
              0
            ))}
          </Text>
        </View>
        <View
          className={`flex flex-row justify-between items-center px-4 py-2 bg-green-500`}
        >
          <Text className="font-semibold text-white">Descuento:</Text>
          <Text className="font-semibold text-white">
            C${" "}
            {Math.ceil(
              productosSele.reduce((acc,prd) => {
                const prod = productos.find((p) => p.id === prd.id);

                if(!prod) return acc;

                return acc + ((prod.precio - prd.precio ) * prd.cantidad);
              }, 0)
            )}
          </Text>
        </View>
        <View className="flex flex-row justify-between items-center px-4 py-2">
          <View>
            <Text className="text-[10px] font-semibold">Saldo: </Text>
            <Text className="font-semibold">
              C${" "}
              {estado === 'crédito' ? Math.ceil(productosSele.reduce(
                (acc, prod) => acc + prod.precio * prod.cantidad,
                0
              ) - pagado) : 0 }
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setEstado("contado");
              setPagado(0);
            }}
            disabled={estado === "contado"}
            className={`w-28 border py-2 ${
              estado === "crédito" ? "border-green-600" : "border-zinc-400"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold  ${
                estado === "crédito" ? "text-green-600" : "text-zinc-400"
              }`}
            >
              Pagado ahora
            </Text>
          </Pressable>
          <TextInput
            keyboardType="numeric"
            value={pagado.toString()}
            className="bg-green-100 text-black h-8 p-0 w-20 text-center border border-green-700 rounded-sm"
            onChangeText={(text) => {
              if (isNaN(parseFloat(text))) {
                setPagado(0);
                return;
              }

              if (parseFloat(text) < 0) {
                setPagado(0);
                return;
              }

              if(parseFloat(text) > Math.ceil(productosSele.reduce(
                (acc, prod) => acc + prod.precio * prod.cantidad,
                0
              ))) return;

              setPagado(parseFloat(text));
            }}
            editable={estado === "crédito"}
          />
        </View>
      </View>
      <View className="bg-zinc-700 flex flex-row">
        <Pressable
          onPress={async () => {
            setLoading(true)
            await saveFacture()
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
            setLoading(true)
            await exportFacture()
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
            setLoading(true)
            await printFacture()
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
      <Impresoras
        cliente={id}
        productos={productosSele}
        id={idFac}
        visible={visible}
        estado={estado}
        fecha={fecha}
        create={true}
        pagado={pagado}
        setVisible={setVisible}
      />
    </SafeAreaView>
  );
}
