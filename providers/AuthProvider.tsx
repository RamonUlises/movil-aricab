import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage/src";
import { ActivityIndicator, Text, View } from "react-native";
import { server } from "../lib/server";
import { Login } from "../components/Login";
import { StatusBar } from "expo-status-bar";
import { io } from "socket.io-client";
import { NotConnection } from "../components/NotConnection";

const AuthContext = createContext({
  isAuthenticated: false,
  login: async (username: string, password: string) => {},
  logout: async () => {},
  token: "",
  admin: false,
  usuario: "",
});

const socket = io(server.url);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState(false);
  const [usuario, setUsuario] = useState("");

  useEffect(() => {
    const loadAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const usuarioo = await AsyncStorage.getItem("usuario");

      if (token !== null && usuarioo !== null) {
        setIsAuthenticated(true);
        setToken(token);
        setUsuario(usuarioo);
        setLoading(false);
        return;
      }

      setIsAuthenticated(false);
      setLoading(false);
    };

    loadAuth();

    socket.on("permisoAdmin", async (id: string) => {
      const tokenUser = id.trim();
      const tokenU = await AsyncStorage.getItem("userToken");

      if(tokenU === null) return;

      if (tokenUser.trim() === tokenU.trim()) {
        setAdmin(true);
        // permiso por 3 minutos

        setTimeout(() => {
          setAdmin(false);
        }, 180000);
      }
    });

    return () => {
      socket.off("permisoAdmin");
    };
  }, []);

  const login = async (usuario: string, password: string) => {
    try {
      const response = await fetch(`${server.url}/rutas/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${server.credetials}`,
        },
        body: JSON.stringify({ usuario, password }),
      });

      const { message, token, usuarioo } = await response.json();

      if (response.status !== 200) {
        return alert(message);
      }

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("usuario", usuarioo);

      setIsAuthenticated(true);
      setToken(token);
      setUsuario(usuarioo);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("usuario");
    setIsAuthenticated(false);
    setToken("");
    setAdmin(false);
    setUsuario("");
  };

  if (loading) {
    return (
      <View className="bg-slate-200 w-full h-full justify-center items-center flex-row">
        <ActivityIndicator size="large" />
        <Text className="text-center text-md font-bold">Cargando datos del facturador</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, admin, usuario }}
    >
      <StatusBar style="dark" translucent />
      {isAuthenticated ? children : <Login login={login} />}
      <NotConnection />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
