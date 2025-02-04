import { createContext, useContext, useEffect, useState } from "react";
import { FacturaType, ProductoFacturaType } from "../types/facturas";
import { ActivityIndicator, View } from "react-native";
import { server } from "../lib/server";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const FacturasContext = createContext({
  facturas: [] as FacturaType[],
});

const socket = io(server.url);

export default function FacturasProvider ({ children }: { children: React.ReactNode}) {
  const [facturas, setFacturas] = useState([] as FacturaType[]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchFacturas = async () => {
    try {
      const response = await fetch(`${server.url}/facturas/rutas/${token}`, {
        headers: {
          'Authorization': `Basic ${server.credetials}`
        }
      });
      const data: FacturaType[] = await response.json();

      Array.isArray(data) ? setFacturas(data) : setFacturas([]);
      setLoading(false);
    } catch {
      setFacturas([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on('facturaAdd', (factura: FacturaType) => {
      if(factura["id-facturador"] !== token) return;
      setFacturas((prevFacturas) => [factura, ...prevFacturas]);
    });

    socket.on('facturaUpdate', ({ id, productos, total, tipo, pagado, facturador }: { id: string, productos: ProductoFacturaType[], total: number, tipo: string, pagado: number, facturador: string }) => {
      if(facturador !== token) return;
      setFacturas((prevFacturas) => {
        const updatedFacturas = prevFacturas.map((prevFactura) => {
          if(prevFactura.id === id){
            return { ...prevFactura, productos, total, tipo, pagado };
          }

          return prevFactura;
        });

        return updatedFacturas;
      });
    });

    socket.on('facturaDelete', (id: string, facturador: string) => {
      if(facturador !== token) return;
      setFacturas((prevFacturas) => prevFacturas.filter((prevFactura) => prevFactura.id !== id));
    });

    socket.on('facturaAbonar', ({ id, total }: {id: string, total: number}) => {
      setFacturas((prevFacturas) => {
        const updatedFacturas = prevFacturas.map((prevFactura) => {
          if(prevFactura.id === id){
            console.log('updated', total);
            return { ...prevFactura, pagado: total };
          }

          return prevFactura;
        });

        return updatedFacturas;
      });
    });

    fetchFacturas();

    return () => {
      socket.off('facturaAdd');
      socket.off('facturaUpdate');
      socket.off('facturaDelete');
      socket.off('facturaAbonar');
    }
  }, []);

  if(loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <FacturasContext.Provider value={{ facturas }}>
      {children}
    </FacturasContext.Provider>
  );
}

export const useFacturas = () => useContext(FacturasContext);