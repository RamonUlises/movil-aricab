import { server } from "./server";

export async function crearReporteDevolucion(id: string, facturador: string, nombre: string, fecha: string, productos: { id: string; nombre: string; cantidad: number; precio: number }[], total: number) {
  try {
    const response = await fetch(`${server.url}/devoluciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${server.credetials}`,
      },
      body: JSON.stringify({ id, facturador, nombre, fecha, productos, total }),
    });

    if(response.status === 200) return true;

    return false;
  } catch {
    return false;
  }
}

export async function editarReporteDevolucion(id: string, productos: { id: string; nombre: string; cantidad: number; precio: number }[], total: number) {
  try {
    const response = await fetch(`${server.url}/devoluciones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${server.credetials}`,
      },
      body: JSON.stringify({ productos, total }),
    });

    if(response.status === 200) return true;

    return false;
  } catch {
    return false;
  }
}