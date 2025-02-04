import { FacturaType } from "../types/facturas";

export function buscarFacturaCliente(facturas: FacturaType[], nombre: string) {
  let inicio = 0;
  let fin = facturas.length - 1;
  let resultados: FacturaType[] = [];

  while (inicio <= fin) {
    const mitad = Math.floor((inicio + fin) / 2);
    const factura = facturas[mitad];
    const nombreFactura = factura.nombre.toLowerCase();
    const nombreBusqueda = nombre.toLowerCase();

    // Si encontramos una coincidencia parcial, exploramos hacia la izquierda y derecha
    if (nombreFactura.includes(nombreBusqueda)) {
      // Agregar la factura actual
      resultados.push(factura);

      // Buscar hacia la izquierda
      let izquierda = mitad - 1;
      while (izquierda >= 0 && facturas[izquierda].nombre.toLowerCase().includes(nombreBusqueda)) {
        resultados.push(facturas[izquierda]);
        izquierda--;
      }

      // Buscar hacia la derecha
      let derecha = mitad + 1;
      while (derecha < facturas.length && facturas[derecha].nombre.toLowerCase().includes(nombreBusqueda)) {
        resultados.push(facturas[derecha]);
        derecha++;
      }

      // Una vez que hemos explorado ambos lados, salimos
      break;
    }

    // Modificar el rango de búsqueda
    if (nombreFactura < nombreBusqueda) {
      inicio = mitad + 1;
    } else {
      fin = mitad - 1;
    }
  }

  return resultados;
}
