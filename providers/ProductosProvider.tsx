import io from "socket.io-client";
import { server } from "../lib/server";
import { createContext, useContext, useEffect, useState } from "react";
import { ProductoType } from "../types/productos";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "./AuthProvider";
import { RutasProductosType } from "../types/rutasProductos";

const socket = io(server.url);

const ProductosContext = createContext({
  productos: [] as ProductoType[],
  fetchProductos: async () => {},
});

export default function ProductosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productos, setProductos] = useState([] as ProductoType[]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  const fetchProductos = async () => {
    try {
      setProductos([]);

      const response = await fetch(`${server.url}/rutas/${token}/productos`, {
        headers: {
          Authorization: `Basic ${server.credetials}`,
        },
      });
      const data: RutasProductosType = await response.json();

      if (response.status > 400) {
        setProductos([]);
        setLoading(false);

        return;
      }

      setProductos(data.productos);
      setLoading(false);
    } catch {
      setProductos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("updateProd", () => {
      setProductos([]);
      fetchProductos();
    });

    socket.on("productUpdate", ({ id, nombre, precioVenta }: { id: string, nombre: string, precioVenta: number}) => {
      setProductos((productos) => {
        const newProductos = productos.map((producto) => {
          if (producto.id === id) {
            return {
              id: producto.id,
              cantidad: producto.cantidad,
              nombre,
              precio: precioVenta,
            };
          }

          return producto;
        });

        return newProductos;
      });
    });

    fetchProductos();

    return () => {
      socket.off("updateProd");
      socket.off("productUpdate");
    };
  }, []);

  if (loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center flex flex-row gap-2">
        <ActivityIndicator size="large" />
        <Text className="text-center text-md font-bold">Cargando productos</Text>
      </View>
    );
  }

  return (
    <ProductosContext.Provider value={{ productos, fetchProductos }}>
      {children}
    </ProductosContext.Provider>
  );
}

export const useProductos = () => useContext(ProductosContext);
