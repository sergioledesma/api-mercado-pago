import {Router} from 'express';
import { mercadoPagoController } from './MercadoPago_Controller';
import cors from 'cors';
const corsOptions = {origin: '*'}
// const corsOptions = {origin: 'https://obleasintegrado.municipiosanjuan.gob.ar,https://obleasintegrado.municipiosanjuan.gob.ar'}
// var whitelist = ['https://obleasintegrado.municipiosanjuan.gob.ar', 'https://mercapasa.municipiosanjuan.gob.ar']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

const router: Router = Router();
class MercadoPagoRouter {
    router:Router;
    constructor(){
        this.router = router;
        this.routes();
    }
    routes(){
        this.router.post('/checkout',cors(corsOptions), mercadoPagoController.checkout);
        this.router.post('/notificaciones', mercadoPagoController.notificaciones);
        this.router.get('/prueba', mercadoPagoController.prueba);
    }
}
const mercadoPagoRouter = new MercadoPagoRouter();
export default mercadoPagoRouter.router;