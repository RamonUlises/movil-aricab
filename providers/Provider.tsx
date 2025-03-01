import AuthProvider from "./AuthProvider";
import ProductosProvider from "./ProductosProvider";
import ClientesProvider from "./ClientesProvider";
import FacturasProvider from "./FacturasProvider";
import { DevicesProvider } from "./BluetoothDevices";
import CambiosProvider from "./CambiosProvider";
import DevolucionesProvider from "./DevolucionesProvider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductosProvider>
        <ClientesProvider>
          <DevicesProvider>
            <FacturasProvider>
              <CambiosProvider>
                <DevolucionesProvider>{children}</DevolucionesProvider>
              </CambiosProvider>
            </FacturasProvider>
          </DevicesProvider>
        </ClientesProvider>
      </ProductosProvider>
    </AuthProvider>
  );
}
