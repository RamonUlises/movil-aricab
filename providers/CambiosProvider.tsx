import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../lib/server";
import io from "socket.io-client";
import { ActivityIndicator, Text, View } from "react-native";
import { CambiosType, ProductoCambio } from "../types/cambios";
import { useAuth } from "./AuthProvider";

const socket = io(server.url);

const CambiosContext = createContext({
  cambios: [] as CambiosType[],
});

export default function CambiosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cambios, setCambios] = useState([] as CambiosType[]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  async function fetchCambios() {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() es 0-indexado
      const dd = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const hoy = new Date(formattedDate);
      const response = await fetch(`${server.url}/cambios/rutas/${token}/fecha/${hoy}`, {
        headers: {
          Authorization: `Basic ${server.credetials}`,
        },
      });
      const data: CambiosType[] = await response.json();

      if (Array.isArray(data)) {
        setCambios(data);
      }

      setLoading(false);
    } catch {
      setCambios([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    socket.on("cambioAdd", (cambio: CambiosType) => {
      if (cambio.facturador !== token) return;
      setCambios((prevCambios) => [cambio, ...prevCambios]);
    });

    socket.on(
      "cambioUpdate",
      ({
        id,
        facturador,
        productos,
      }: {
        id: string;
        facturador: string;
        productos: ProductoCambio[];
      }) => {
        if (facturador !== token) return;
        setCambios((prevCambios) =>
          prevCambios.map((prevCambio) => {
            if (prevCambio.id === id) {
              return { ...prevCambio, productos };
            }
            return prevCambio;
          })
        );
      }
    );

    socket.on("cambioDelete", (id: string) => {
      setCambios((prevCambios) =>
        prevCambios.filter((prevCambio) => prevCambio.id !== id)
      );
    });

    fetchCambios();

    return () => {
      socket.off("cambioAdd");
      socket.off("cambioUpdate");
      socket.off("cambioDelete");
    };
  }, []);

  if (loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center flex-row">
        <ActivityIndicator size="large" />
        <Text className="text-center text-md font-bold">Cargando cambios</Text>
      </View>
    );
  }

  return (
    <CambiosContext.Provider value={{ cambios }}>
      {children}
    </CambiosContext.Provider>
  );
}

export const useCambios = () => useContext(CambiosContext);
