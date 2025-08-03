import { createContext, useContext, useEffect, useState } from "react";
import { FacturaType, ProductoFacturaType } from "../types/facturas";
import { ActivityIndicator, Text, View } from "react-native";
import { server } from "../lib/server";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { RecuperacionType } from "../types/recuperacion";

const RecuperacionContext = createContext({
  recuperacion: [] as RecuperacionType[],
});

const socket = io(server.url);

export default function RecuperacionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recuperacion, setRecuperacion] = useState([] as RecuperacionType[]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchRecuperacion = async () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() es 0-indexado
      const dd = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const hoy = new Date(formattedDate);
      const response = await fetch(
        `${server.url}/recuperacion/facturador/${token}/${hoy}`,
        {
          headers: {
            Authorization: `Basic ${server.credetials}`,
          },
        }
      );
      const data: RecuperacionType[] = await response.json();

      Array.isArray(data) ? setRecuperacion(data) : setRecuperacion([]);

      setLoading(false);
    } catch {
      setRecuperacion([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("recuperacionAdd", (recuperacion: RecuperacionType) => {
      if (recuperacion.facturador !== token) return;
      setRecuperacion((prev) => [recuperacion, ...prev]);
    });


    fetchRecuperacion();

    return () => {
      socket.off("recuperacionAdd");
    };
  }, []);

  if (loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center flex gap-2 flex-row">
        <ActivityIndicator size="large" />
        <Text className="text-center text-md font-bold">Cargando recuperaciones</Text>
      </View>
    );
  }

  return (
    <RecuperacionContext.Provider value={{ recuperacion }}>
      {children}
    </RecuperacionContext.Provider>
  );
}

export const useRecuperacion = () => useContext(RecuperacionContext);
