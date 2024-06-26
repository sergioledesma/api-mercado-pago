import {Request, Response} from 'express';
const responder = {
  sucess: (req: Request, res: Response, value?: any, message?: string, status?: number) => {
    let statusCode = status || 200;
    let statusMessage = message || 'ok';
    res.status(statusCode).json({
      error: false,
      status: statusCode,
      message: statusMessage,
      value: value,
    });
  },
  error: (req: Request, res: Response, err?: any, message?: string, status?: number) => {
    let statusCode = status || 500;
    let statusMessage = message || 'Error interno del servidor.';
    let errorObject = err || {};
    console.error(errorObject);
    res.status(statusCode).json({
      error: true,
      status: statusCode,
      message: statusMessage,
    });
  },
  noAutorizado: (req: Request, res: Response) => {
    let statusCode = 401;
    res.status(statusCode).json({
      error: true,
      status: statusCode,
      message: 'No posee autorización para acceder a la ruta solicitada.',
    });
  },
  noEncontrado: (req: Request, res: Response) => {
    let statusCode = 404;
    res.status(statusCode).json({
      error: true,
      status: statusCode,
      message: 'Ruta inexistente.',
    });
  },
};

export default responder;
