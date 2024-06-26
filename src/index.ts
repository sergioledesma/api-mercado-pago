import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import {Request, Response} from 'express';
import path from "path";
import formData from 'express-form-data';
import responder from './Middlewares/responder';
import MercadoPago_Router from './Componentes/MercadoPago/MercadoPago_Router';
///// VARIABLES DE ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'desarrollo';
class Server{
    public app: express.Application;
    private options = {
      uploadDir: 'public/archivos/',
      autoClean: true,
    };
    constructor() {
        this.app = express();
        this.app.use(express.json({limit: '25mb'}));
        this.app.use(express.urlencoded({limit: '25mb'}));
        this.configurar();
        this.routear();
      }
      configurar() {
        this.app.set('port', process.env.PORT || 5000);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(formData.parse(this.options));
        this.app.use(formData.union());
        this.app.use(express.static('public'));
        this.app.set("view engine", "html");
        this.app.engine("html", require("hbs").__express);
        this.app.set("views", path.join(__dirname, "views"))
      }
      routear() {
        //Rutas Basicas
        this.app.get('/', (req: Request, res: Response) => {
          res.send('Server iniciado');
        });
    
        this.app.get('/prueba', (req: Request, res: Response) => {
          console.log('probando, el server esta operativo...');
        });
        
        //TODO:Aca van las rutas que valla agregando ejemplo this.app.use('/usuarios', usuariosRouter);
        this.app.use('/mercaPago',MercadoPago_Router);
        this.app.get('*', (req: Request, res: Response) => {
          console.info(`GET 404: ${req.originalUrl}`);
          responder.noEncontrado(req, res);
        });
      }
      iniciar() {
        this.app.listen(this.app.get('port'), () => {
          console.log(
            `⚡️[SERVER]: El Servidor de ${process.env.NODE_ENV} esta corriendo en el puerto ${process.env.PORT}`
          );
        });
      }
}
const SERVER = new Server();
SERVER.iniciar();
process.on('uncaughtException', function (err) {
    console.log('Error!! atrapado: ' + err);
  });