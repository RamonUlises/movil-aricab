import { server } from "./server";

export async function crearReporteCambio(
  id: string,
  nombre: string,
  facturador: string,
  fecha: string,
  prod: {
    [key: string]: {
      nombre: string;
      cantidad: number;
    };
  }
) {
  const productos: { id: string; nombre: string; cantidad: number }[] =
    Object.entries(prod).map(([id, { nombre, cantidad }]) => ({
      id,
      nombre,
      cantidad,
    }));

  try {
    const response = await fetch(`${server.url}/cambios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${server.credetials}`,
      },
      body: JSON.stringify({ id, nombre, productos, facturador, fecha }),
    });

    if(response.status === 200) return true;

    return false;
  } catch {
    return false;
  }
}

export async function editarReporteCambio(
  id: string,
  prod: {
    [key: string]: {
      nombre: string;
      cantidad: number;
    };
  }
) {
  const productos: { id: string; nombre: string; cantidad: number }[] =
    Object.entries(prod).map(([id, { nombre, cantidad }]) => ({
      id,
      nombre,
      cantidad,
    }));

  try {
    const response = await fetch(`${server.url}/cambios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${server.credetials}`,
      },
      body: JSON.stringify({ productos }),
    });

    if(response.status === 200) return true;

    return false;
  } catch {
    return false;
  }
}
