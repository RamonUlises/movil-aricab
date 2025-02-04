import { PrdSlc } from "../types/productosSeleccionados";
import { server } from "./server";

export async function crearFacturaServer({ id, nombre, productos, tipo, facturador, fecha, pagado }: { id: string, nombre: string, productos: PrdSlc[], tipo: string, facturador: string, fecha: Date, pagado: number }) {
  try {
    const response = await fetch(`${server.url}/facturas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${server.credetials}`
      },
      body: JSON.stringify({ id, nombre, productos, tipo, facturador, fecha, pagado })
    });

    if (response.status === 200) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function editarFacturaServer({ id, productos, tipo, pagado }: { id: string, productos: PrdSlc[], tipo: string, pagado: number }) {
  try {
    const response = await fetch(`${server.url}/facturas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${server.credetials}`
      },
      body: JSON.stringify({ productos, tipo, pagado })
    });

    if (response.status === 200) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function abonarFacturaServer({ id, abono }: { id: string, abono: number }) {
  try {
    const response = await fetch(`${server.url}/facturas/abonar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${server.credetials}`
      },
      body: JSON.stringify({ abono })
    });

    if (response.status === 200) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}