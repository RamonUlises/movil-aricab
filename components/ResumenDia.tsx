import { Text, View } from "react-native";
import { InfoFacturasDia } from "./InfoFacturasDia";
import { InfoCambios } from "./InfoCambios";
import { InfoProductos } from "./InfoProductos";
import { FacturaType } from "../types/facturas";
import { DevolucionesType } from "../types/devoluciones";
import { CambiosType } from "../types/cambios";

export function ResumenDia({
  facturas,
  devoluciones,
  cambios,
}: {
  facturas: FacturaType[];
  devoluciones: DevolucionesType[];
  cambios: CambiosType[];
}) {
  const devolucionesTotal = devoluciones.reduce((acc, d) => acc + d.total, 0);

  const totalNeto =
    facturas
      .filter((f) => f.tipo === "contado" || f.tipo === "crédito")
      .reduce((acc, f) => acc + f.pagado, 0) -
    parseFloat(devolucionesTotal.toFixed(2));

  return (
    <>
      <InfoFacturasDia facturasHoy={facturas} />
      <View className="mx-auto mt-2 py-2 rounded-sm">
        <Text className="text-center text-lg text-zinc-800">
          Devolución: C$ {devolucionesTotal}
        </Text>
      </View>
      <View className="mx-auto mb-4 py-2 rounded-sm">
        <Text className="text-center text-lg text-zinc-800">
          Abonos: C${" "}
          {facturas
            .filter((f) => f.tipo === "crédito")
            .reduce((acc, f) => acc + f.pagado, 0)}
        </Text>
      </View>
      <View className="flex flex-row mb-4">
        <Text className="font-medium bg-green-600 w-1/2 text-center text-xl text-white rounded-r-xl">
          Total Neto:
        </Text>
        <Text className="font-medium text-green-600 w-1/2 -ml-2 text-center text-xl rounded-r-xl border-y border-green-600 border-r">
          C$ {totalNeto.toFixed(2)}
        </Text>
      </View>

      <InfoCambios
        cambios={cambios}
      />
      <InfoProductos
        facturas={facturas}
      />
    </>
  );
}
