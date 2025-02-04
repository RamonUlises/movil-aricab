import { ClienteType } from "../types/clientes";

export function buscarClientes(clientes: ClienteType[], text: string) {
  let inicio = 0;
  let fin = clientes.length - 1;
  let resultados: ClienteType[] = [];

  while (inicio <= fin) {
    const mitad = Math.floor((inicio + fin) / 2);
    const cliente = clientes[mitad];

    // Si encontramos una coincidencia parcial, la agregamos a los resultados
    if (cliente.nombres.toLowerCase().includes(text.toLowerCase())) {
      resultados.push(cliente);

      // Explorar hacia la izquierda
      let izquierda = mitad - 1;
      while (izquierda >= 0 && clientes[izquierda].nombres.toLowerCase().includes(text.toLowerCase())) {
        resultados.push(clientes[izquierda]);
        izquierda--;
      }

      // Explorar hacia la derecha
      let derecha = mitad + 1;
      while (derecha < clientes.length && clientes[derecha].nombres.toLowerCase().includes(text.toLowerCase())) {
        resultados.push(clientes[derecha]);
        derecha++;
      }

      // Salir después de encontrar todas las coincidencias
      break;
    }

    // Modificar el rango de búsqueda de acuerdo con la comparación
    if (cliente.nombres.toLowerCase() < text.toLowerCase()) {
      inicio = mitad + 1;
    } else {
      fin = mitad - 1;
    }
  }

  return resultados;
}
