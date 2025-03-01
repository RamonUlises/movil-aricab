import { createContext, useContext, useEffect, useState } from "react";
import { ClienteType } from "../types/clientes";
import { server } from "../lib/server";
import io from 'socket.io-client';
import { ActivityIndicator, View } from "react-native";

const socket = io(server.url);

const ClienteContext = createContext({
  clientes: [] as ClienteType[],
});

export default function ClientesProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState([] as ClienteType[]);
  const [loading, setLoading] = useState(true);

  async function fetchClientes(){
    try{
      const response = await fetch(`${server.url}/clientes`, {
        headers: {
          'Authorization': `Basic ${server.credetials}`
        }
      });
      const data: ClienteType[] = await response.json();

      data.forEach((cliente) => {
        setClientes((prevClientes) => [...prevClientes, { id: cliente.id, nombres: cliente.nombres, direccion: cliente.direccion, telefono: cliente.telefono }]);
      });

      setLoading(false);
    } catch {
      setClientes([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    socket.on('clienteAdd', (cliente: ClienteType) => {
      addCliente(cliente);
    });

    socket.on('clienteUpdate', (cliente: ClienteType) => {
      updateCliente(cliente);
    });

    socket.on('clienteDelete', (id: string) => {
      setClientes((prevClientes) => prevClientes.filter((prevCliente) => prevCliente.id !== id));
    });

    fetchClientes();

    return () => {
      socket.off('clienteAdd');
      socket.off('clienteUpdate');
      socket.off('clienteDelete');
    };
  }, []);

  function addCliente(cliente: ClienteType){
    setClientes((prevClientes) => {
      const updateClientes = [...prevClientes, cliente];

      updateClientes.sort((a, b) => a.nombres.localeCompare(b.nombres));
      return updateClientes;
    });
  }

  function updateCliente(cliente: ClienteType){
    setClientes((prevClientes) => {
      const updateClientes = prevClientes.map((prevCliente) => {
        if(prevCliente.id === cliente.id){
          return { id: cliente.id, nombres: cliente.nombres, direccion: cliente.direccion, telefono: cliente.telefono };
        }

        return prevCliente;
      });

      updateClientes.sort((a, b) => a.nombres.localeCompare(b.nombres));
      return updateClientes;
    });
  }

  if(loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ClienteContext.Provider value={{ clientes }}>
      {children}
    </ClienteContext.Provider>
  )
}

export const useClientes = () => useContext(ClienteContext);