import AuthProvider from "./AuthProvider";
import ProductosProvider from "./ProductosProvider";
import ClientesProvider from "./ClientesProvider";
import FacturasProvider from "./FacturasProvider";
import { DevicesProvider } from "./BluetoothDevices";
import CambiosProvider from "./CambiosProvider";
import DevolucionesProvider from "./DevolucionesProvider";
import RecuperacionProvider from "./RecuperacionProvider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductosProvider>
        <ClientesProvider>
          <FacturasProvider>
            <CambiosProvider>
              <DevolucionesProvider>
                <RecuperacionProvider>
                  <DevicesProvider>{children}</DevicesProvider>
                </RecuperacionProvider>
              </DevolucionesProvider>
            </CambiosProvider>
          </FacturasProvider>
        </ClientesProvider>
      </ProductosProvider>
    </AuthProvider>
  );
}
