import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BluetoothManager } from "react-native-bluetooth-escpos-printer";

const DevicesContext = createContext({
  devices: [] as Array<{ address: string; name: string }>,
  reloadDevices: async () => {},
});

export function DevicesProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<{ address: string; name: string }[]>(
    []
  );

  async function scanDevices() {
    try {
      // Asegúrate de que Bluetooth está habilitado
      const isBluetoothEnabled = await BluetoothManager.isBluetoothEnabled();
      if (!isBluetoothEnabled) {
        await BluetoothManager.enableBluetooth();
      }

      // Escanear dispositivos Bluetooth
      const foundDevices = await BluetoothManager.scanDevices();
      const parsedDevices = JSON.parse(foundDevices || "{}"); // El resultado está en formato JSON
      const { paired, found } = parsedDevices;

      // Combinar dispositivos emparejados y encontrados
      const allDevices = [...(paired || []), ...(found || [])];
      return allDevices;
    } catch (error) {
      console.error("Error al escanear dispositivos:", error);
      return [];
    }
  }

  async function reloadDevices() {
    setDevices(await scanDevices());
  }

  async function requestPermissions() {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (err) {
        console.error("Error al solicitar permisos:", err);
      }
    }
  }

  useEffect(() => {
    (async () => {
      await requestPermissions();
      setDevices(await scanDevices());
    })();
  }, []);

  return (
    <DevicesContext.Provider value={{ devices, reloadDevices }}>
      <StatusBar style="dark" translucent />
      {children}
    </DevicesContext.Provider>
  );
}

export const useDevice = () => useContext(DevicesContext);
