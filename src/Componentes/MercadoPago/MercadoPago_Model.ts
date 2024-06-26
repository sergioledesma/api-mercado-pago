import {model, Schema} from 'mongoose';
import IMercadoPago from './MercadoPago_Interface';
const MercadoPagoSchema = new Schema({
    productos: Array,
    back_urls:Object,
})
export default model<IMercadoPago>('modeloMercadoPago',MercadoPagoSchema)