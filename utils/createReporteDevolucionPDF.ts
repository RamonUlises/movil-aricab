import { ClienteType } from "../types/clientes";
import { ProductosDevolucion } from "../types/devoluciones";
import { buscarClienteNombre } from "./buscarCliente";
import * as Print from "expo-print";

export async function createReporteDevolucionPDF(
  productos: ProductosDevolucion[],
  cliente: string,
  clientes: ClienteType[],
  id: string,
  fecha: Date,
  total: number
) {
  try {
    const direccion =
      buscarClienteNombre(cliente, clientes)?.direccion ?? "Desconocida";

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <title>Factura</title>
          <style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body{
  max-width: 500px;
  margin-inline: auto;
}

h1{
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

p{
  text-align: center;
  margin-bottom: 1px;
}

table{
  margin: 0 auto 10px auto;
  width: 90%;
  margin-top: 20px;
}

table thead tr th {
  text-align: start;
}

table thead tr th:first-child{
  width: 70%;
}

table thead tr th:nth-child(2){
  width: 30%;
}

.pxc{
  text-align: start;
  margin-bottom: 3px;
}

.total{
  font-weight: bold;
}

.totales{
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin-inline: auto;
  margin-block: 8px;
}
.div-steps{
  max-width: 100%;
  width: 100%;
  height: 2px;
  background: repeating-linear-gradient(
        to right,
        transparent,
        transparent 10px,
        black 10px,
        black 20px
      );
}
      .text{
  text-align: right;
}
          </style>
        </head>
        <body>
          <h1>Ari-Cab</h1>
<p><strong>Factura:</strong> ${id}</p>
<p><strong>Teléfono empresa:</strong> 88437565-89053304</p>
<p><strong>Cliente:</strong> ${cliente}</p>
<p><strong>Dirección:</strong> ${direccion}</p>
<p><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString()}</p>
    <br>
    <h2 style="font-size: 21px; text-align: center">Reporte devolución</h2>
    <br>
<div style="margin-top: 10px" class="div-steps"></div>
<div class="totales">
  <p style="font-weight: bold">Producto</p>
  <p style="font-weight: bold">Monto</p>
</div>
<div class="div-steps"></div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${productos
                .map(
                  ({ nombre, cantidad, precio }) => `
                <tr>
                  <td>
                    ${nombre}
                    <p class="pxc">${cantidad} x ${precio}</p>  
                  </td>
                  <td class="text">C$ ${cantidad * precio}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="div-steps"></div>
<div class="totales">
  <p class="total">Gran total:</p>
  <p>C$ ${total}</p>
</div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    return uri;
  } catch (error) {
    console.error(error);
  }
}
