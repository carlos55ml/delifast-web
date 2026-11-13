import type { components } from "./schema";

/** Alias legibles de los esquemas del contrato (generados en schema.d.ts con `npm run api:types`). */
type Esquemas = components["schemas"];

export type Rol = Esquemas["Rol"];
export type Perfil = Esquemas["Perfil"];
export type Localidad = Esquemas["Localidad"];
export type DatosNegocio = Esquemas["DatosNegocio"];
export type AltaNegocio = Esquemas["AltaNegocio"];
export type NegocioAdmin = Esquemas["NegocioAdmin"];
export type IncidenciaAdmin = Esquemas["IncidenciaAdmin"];
export type EstadoIncidencia = Esquemas["EstadoIncidencia"];
export type TipoIncidencia = Esquemas["TipoIncidencia"];
export type OrigenIncidencia = Esquemas["OrigenIncidencia"];
export type ResumenAdmin = Esquemas["ResumenAdmin"];
export type Problema = Esquemas["Problema"];
export type EstadoPedido = Esquemas["EstadoPedido"];
export type MetodoPago = Esquemas["MetodoPago"];
export type MiNegocio = Esquemas["MiNegocio"];
export type LineaPedido = Esquemas["LineaPedido"];
export type CambioEstado = Esquemas["CambioEstado"];
export type PedidoNegocio = Esquemas["PedidoNegocio"];
export type RepartidorNegocio = Esquemas["RepartidorNegocio"];
export type FranjaHorario = Esquemas["FranjaHorario"];
export type DatosMiNegocio = Esquemas["DatosMiNegocio"];
export type CategoriaCarta = Esquemas["CategoriaCarta"];
export type ProductoCarta = Esquemas["ProductoCarta"];
export type DatosProducto = Esquemas["DatosProducto"];
export type EmpleadoNegocio = Esquemas["EmpleadoNegocio"];
export type DatosMiembro = Esquemas["DatosMiembro"];
export type AltaMiembro = Esquemas["AltaMiembro"];
export type IncidenciaNegocio = Esquemas["IncidenciaNegocio"];
export type Periodo = Esquemas["Periodo"];
export type EstadisticasNegocio = Esquemas["EstadisticasNegocio"];
