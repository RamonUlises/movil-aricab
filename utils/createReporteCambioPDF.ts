import { ClienteType } from "../types/clientes";
import { buscarClienteNombre } from "./buscarCliente";
import * as Print from "expo-print";

export async function createReporteCambioPDF(
  productos: {
    [key: string]: {
      nombre: string;
      cantidad: number;
    };
  },
  cliente: string,
  clientes: ClienteType[],
  id: string,
  fecha: Date
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
    <p><strong>Reporte:</strong> ${id}</p>
    <p><strong>Teléfono empresa:</strong> 88437565-89053304</p>
    <p><strong>Cliente:</strong> ${cliente}</p>
    <p><strong>Dirección:</strong> ${direccion}</p>
    <p><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString()}</p>
    <br>
    <h2 style="font-size: 21px; text-align: center">Producto mal estado</h2>
    <br>
    <div style="margin-top: 10px" class="div-steps"></div>
    <div class="totales">
      <p style="font-weight: bold">Producto</p>
      <p style="font-weight: bold">Cantidad</p>
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
                  ${Object.keys(productos)
                    .map(
                      (id) => `
                    <tr>
                      <td class="pxc">${productos[id].nombre}</td>
                      <td class="text">${productos[id].cantidad}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    return uri;
  } catch (error) {
    console.error(error);
  }
}
