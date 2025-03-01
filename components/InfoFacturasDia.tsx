import { Text, View } from "react-native";
import { FacturaType } from "../types/facturas";

export const InfoFacturasDia = ({
  facturasHoy,
}: {
  facturasHoy: FacturaType[];
}) => {
  return (
    <>
      <View className="w-full flex flex-col gap-2">
        <Text className="text-xl font-semibold">Contado:</Text>
        <View className="flex flex-row">
          <Text className="font-medium bg-green-600 w-1/2 text-center text-xl text-white rounded-r-xl">
            {facturasHoy.filter((f) => f.tipo === "contado").length}
          </Text>
          <Text className="font-medium text-green-600 w-1/2 -ml-2 text-center text-xl rounded-r-xl border-y border-green-600 border-r">
          C${" "}
            {facturasHoy
              .filter((f) => f.tipo === "contado")
              .reduce((acc, f) => acc + f.total, 0)}
          </Text>
        </View>
        <Text className="text-xl font-semibold">Credito:</Text>
        <View className="flex flex-row">
          <Text className="font-medium bg-green-600 w-1/2 text-center text-xl text-white rounded-r-xl">
            {facturasHoy.filter((f) => f.tipo === "crédito").length}
          </Text>
          <Text className="font-medium text-green-600 w-1/2 -ml-2 text-center text-xl rounded-r-xl border-y border-green-600 border-r">
          C${" "}
            {facturasHoy
              .filter((f) => f.tipo === "crédito")
              .reduce((acc, f) => acc + f.total, 0)}
          </Text>
        </View>
        <Text className="text-xl font-semibold">Total:</Text>
        <View className="flex flex-row">
          <Text className="font-medium bg-green-600 w-1/2 text-center text-xl text-white rounded-r-xl">
            {facturasHoy.length}
          </Text>
          <Text className="font-medium text-green-600 w-1/2 -ml-2 text-center text-xl rounded-r-xl border-y border-green-600 border-r">
          C$ {facturasHoy.reduce((acc, f) => acc + f.total, 0)}
          </Text>
        </View>
      </View>
    </>
  );
};
