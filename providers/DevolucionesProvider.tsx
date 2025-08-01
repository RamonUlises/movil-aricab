import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../lib/server";
import io from "socket.io-client";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "./AuthProvider";
import { DevolucionesType, ProductosDevolucion } from "../types/devoluciones";

const socket = io(server.url);

const DevolucionesContext = createContext({
  devoluciones: [] as DevolucionesType[],
});

export default function DevolucionesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [devoluciones, setDevoluciones] = useState([] as DevolucionesType[]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  async function fetchDevoluciones() {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() es 0-indexado
      const dd = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const hoy = new Date(formattedDate);
      const response = await fetch(`${server.url}/devoluciones/rutas/${token}/fecha/${hoy}`, {
        headers: {
          Authorization: `Basic ${server.credetials}`,
        },
      });
      const data: DevolucionesType[] = await response.json();

      if(Array.isArray(data)) {
        setDevoluciones(data);
      }

      setLoading(false);
    } catch {
      setDevoluciones([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    socket.on("devolucionAdd", (devolucion: DevolucionesType) => {
      if (devolucion.facturador !== token) return;
      setDevoluciones((prevDev) => [devolucion, ...prevDev]);
    });

    socket.on(
      "devolucionUpdate",
      ({
        id,
        productos,
        total,
      }: {
        id: string;
        productos: ProductosDevolucion[];
        total: number;
      }) => {
        setDevoluciones((prevDev) =>
          prevDev.map((prevDevo) => {
            if (prevDevo.id === id) {
              return { ...prevDevo, productos, total };
            }
            return prevDevo;
          })
        );
      }
    );

    socket.on("devolucionDelete", (id: string) => {
      setDevoluciones((prevDev) =>
        prevDev.filter((prevDevo) => prevDevo.id !== id)
      );
    });

    fetchDevoluciones();

    return () => {
      socket.off("devolucionAdd");
      socket.off("devolucionUpdate");
      socket.off("devolucionDelete");
    };
  }, []);

  if (loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center flex gap-2 flex-row">
        <ActivityIndicator size="large" />
        <Text className="text-center text-md font-bold">Cargando devoluciones</Text>
      </View>
    );
  }

  return (
    <DevolucionesContext.Provider value={{ devoluciones }}>
      {children}
    </DevolucionesContext.Provider>
  );
}

export const useDevoluciones = () => useContext(DevolucionesContext);
