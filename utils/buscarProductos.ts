import { Productos } from "../types/rutasProductos";

export function buscarProductos(nombre: string, productos: Productos[]) {
  let inicio = 0;
  let fin = productos.length - 1;
  let resultados: Productos[] = [];

  while (inicio <= fin) {
    const mitad = Math.floor((inicio + fin) / 2);
    const producto = productos[mitad];
    const nombreProducto = producto.nombre.toLowerCase();
    const nombreBusqueda = nombre.toLowerCase();

    // Si encontramos una coincidencia parcial, exploramos hacia la izquierda y derecha
    if (nombreProducto.includes(nombreBusqueda)) {
      // Agregar el producto actual
      resultados.push(producto);

      // Buscar hacia la izquierda
      let izquierda = mitad - 1;
      while (izquierda >= 0 && productos[izquierda].nombre.toLowerCase().includes(nombreBusqueda)) {
        resultados.push(productos[izquierda]);
        izquierda--;
      }

      // Buscar hacia la derecha
      let derecha = mitad + 1;
      while (derecha < productos.length && productos[derecha].nombre.toLowerCase().includes(nombreBusqueda)) {
        resultados.push(productos[derecha]);
        derecha++;
      }

      // Una vez que hemos explorado ambos lados, salimos
      break;
    }

    // Modificar el rango de búsqueda
    if (nombreProducto < nombreBusqueda) {
      inicio = mitad + 1;
    } else {
      fin = mitad - 1;
    }
  }

  return resultados;
}
