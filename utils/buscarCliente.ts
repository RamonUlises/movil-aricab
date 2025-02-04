import { ClienteType } from "../types/clientes";

export function buscarClienteNombre(nombres: string, clientes: ClienteType[]) {
  let inicio = 0;
  let fin = clientes.length - 1;
  let cliente: ClienteType | null = null;

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);
    if (clientes[medio].nombres === nombres) {
      cliente = clientes[medio];
      break;
    } else if (clientes[medio].nombres < nombres) {
      inicio = medio + 1;
    } else {
      fin = medio - 1;
    }
  }

  return cliente;
}