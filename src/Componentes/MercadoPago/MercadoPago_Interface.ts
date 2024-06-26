import {Document} from 'mongoose';
export default interface IMercadoPago extends Document{
    productos: Array<any>,
    back_urls:Object,  
}