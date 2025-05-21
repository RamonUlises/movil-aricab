import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useDevice } from "../providers/BluetoothDevices";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { PrdSlc } from "../types/productosSeleccionados";
import { buscarClienteNombre } from "../utils/buscarCliente";
import { useClientes } from "../providers/ClientesProvider";
import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from "react-native-bluetooth-escpos-printer";

export function Impresoras({
  visible,
  id,
  cliente,
  estado,
  productos,
  fecha,
  create,
  setVisible,
  pagado,
}: {
  visible: boolean;
  id: string;
  cliente: string;
  estado: string;
  productos: PrdSlc[];
  fecha: Date;
  create: boolean;
  setVisible?: (visible: boolean) => void;
  pagado: number;
}) {
  const { devices } = useDevice();
  const router = useRouter();
  const [select, setSelect] = useState("");
  const [loading, setLoading] = useState(false);

  const { clientes } = useClientes();

  const direccion =
    buscarClienteNombre(cliente, clientes)?.direccion ?? "Desconocida";

  const connectToPrinter = (address: string) => {
    setLoading(true);
    if (select === address) {
      printToPrinter();
      setLoading(false);
      return;
    }
    BluetoothManager.connect(address).then(
      () => {
        //success here
        setSelect(address);
        printToPrinter();
      },
      (err: string) => {
        console.log("Error al conectar", err);
        Alert.alert("Reintente nuevamente", "Error al conectarse");
      }
    ).finally(() => setLoading(false));
  };

  const printToPrinter = async () => {
    try {
      // Encabezado
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText("Ari-Cab\n", {
        widthtimes: 2,
        heigthtimes: 2,
      });

      // Información de la factura
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText(`Factura\n`, {
        encoding: "UTF8",
      });
      await BluetoothEscposPrinter.printText(`${id}\n`, {
        encoding: "UTF8",
      });
      await BluetoothEscposPrinter.printText(`Telefono: `, {});
      await BluetoothEscposPrinter.printText(`88437565-89053304\n`, {
        encoding: "UTF8",
      });
      await BluetoothEscposPrinter.printText(`Cliente: ${cliente}\n`, {
        encoding: "UTF8",
      });
      await BluetoothEscposPrinter.printText(`Direccion: ${direccion}\n`, {});
      await BluetoothEscposPrinter.printText(
        `Fecha: ${new Date(fecha).toLocaleDateString()}\n`,
        {
          encoding: "UTF8",
        }
      );
      await BluetoothEscposPrinter.printText(`Estado: ${estado}\n`, {
        encoding: "UTF8",
      });

      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      await BluetoothEscposPrinter.printText(
        "- - - - - - - - - - - - - - - - ",
        {}
      );

      // Productos
      await BluetoothEscposPrinter.printColumn(
        [20, 12], // Define los anchos de las columnas (ajusta según tu impresora)
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT], // Alineación de cada columna
        [
          "Producto", // Contenido de la columna izquierda
          "Monto", // Contenido de la columna derecha
        ],
        {}
      );

      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      await BluetoothEscposPrinter.printText(
        "- - - - - - - - - - - - - - - - ",
        {}
      );

      for (const { nombre, cantidad, precio } of productos) {
        // Calcula el total por producto
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT
        );
        const totalPorProducto = `C$${cantidad * precio}`;

        await BluetoothEscposPrinter.printText(`${nombre}\n`, {
          encoding: "UTF8",
        });

        // Imprime el nombre y la información del producto en una columna, y el total en otra
        await BluetoothEscposPrinter.printColumn(
          [20, 12], // Define los anchos de las columnas (ajusta según tu impresora)
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ], // Alineación de cada columna
          [
            `${cantidad} x ${precio}`, // Contenido de la columna izquierda
            totalPorProducto, // Contenido de la columna derecha
          ],
          {
            encoding: "UTF8",
          }
        );
      }

      const total = Math.ceil(productos.reduce(
        (acc, { cantidad, precio }) => acc + cantidad * precio,
        0
      ));

      const pagadoo = Math.ceil(pagado);

      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      await BluetoothEscposPrinter.printText(
        "- - - - - - - - - - - - - - - - ",
        {}
      );

      // Total final
      await BluetoothEscposPrinter.printColumn(
        [20, 12], // Define los anchos de las columnas (ajusta según tu impresora)
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT], // Alineación de cada columna
        [
          "Gran total", // Contenido de la columna izquierda
          `C$ ${total}`, // Contenido de la columna derecha
        ],
        {}
      );
      // Pagado
      await BluetoothEscposPrinter.printColumn(
        [20, 12], // Define los anchos de las columnas (ajusta según tu impresora)
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT], // Alineación de cada columna
        [
          "Pagado", // Contenido de la columna izquierda
          `C$ ${pagadoo}`, // Contenido de la columna derecha
        ],
        {}
      );

      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      await BluetoothEscposPrinter.printText(
        "- - - - - - - - - - - - - - - - ",
        {}
      );

      // saldo
      await BluetoothEscposPrinter.printColumn(
        [20, 12], // Define los anchos de las columnas (ajusta según tu impresora)
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT], // Alineación de cada columna
        [
          "Saldo", // Contenido de la columna izquierda
          `C$ ${total - pagadoo}`, // Contenido de la columna derecha
        ],
        {}
      );
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );

      await BluetoothEscposPrinter.printText(
        "- - - - - - - - - - - - - - - - ",
        {}
      );

      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText("Gracias por su\ncompra\n", {
        widthtimes: 1,
        heigthtimes: 1,
      });
      await BluetoothEscposPrinter.printText("\n\n", {});

      if (create) {
        router.push("(drawer)");
        setVisible && setVisible(false);
      } else {
        setVisible && setVisible(false);
      }
    } catch (error) {
      setSelect("");
      Alert.alert("Reintente nuevamente", "Error al conectarse");
      console.log(error);
    }
  };

  return (
    <Modal visible={visible} className="bg-white">
      <Text className="text-center font-bold text-xl mt-4">
        Dispositivos bluetooth
      </Text>
      <View className="justify-between items-center flex-row mt-3 ml-3 z-20 mb-6 absolute">
        <Pressable
          onPress={() => {
            if (create) {
              router.push("(drawer)");
            } else {
              setVisible && setVisible(false);
            }
          }}
          className="w-1/3 flex flex-col py-2"
        >
          <Feather
            style={{ textAlign: "center" }}
            name="x"
            size={24}
            color="black"
          />
        </Pressable>
      </View>

      <ScrollView
        className="mt-4"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={true}
      >
        {devices.map((dev) => (
          <Pressable
            onPress={() => connectToPrinter(dev.address)}
            key={dev.address}
            className="border-b px-3 py-5 border-slate-300"
          >
            <Text>{dev.name ?? "Desconocido"}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading && (
        <View className="absolute w-screen h-screen bg-black/60 flex justify-center items-center z-50">
          <View className="bg-white flex flex-row justify-center items-center p-4 rounded-lg">
            <ActivityIndicator size="large" />
            <Text className="text-center ml-4 text-xl font-semibold">
              Conectando...
            </Text>
          </View>
        </View>
      )}
    </Modal>
  );
}
