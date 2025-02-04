import AuthProvider from "./AuthProvider";
import ProductosProvider from "./ProductosProvider";
import ClientesProvider from "./ClientesProvider";
import FacturasProvider from "./FacturasProvider";
import { DevicesProvider } from "./BluetoothDevices";
import { enableScreens } from 'react-native-screens';

enableScreens(false);

export function Provider({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>
        <ProductosProvider>
          <ClientesProvider>
            <DevicesProvider>
              <FacturasProvider>{children}</FacturasProvider>
            </DevicesProvider>
          </ClientesProvider>
        </ProductosProvider>
      </AuthProvider>
  );
}
