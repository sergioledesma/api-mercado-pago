import { Request, Response } from "express";
import modeloMercadoPago from "./MercadoPago_Model";
import IMercadoPago from "./MercadoPago_Interface";
import mercadopago from "mercadopago";
import responder from "../../Middlewares/responder";
const mercadoPagoAccessToken = process.env.MERCADO_PAGO_SAMPLE_ACCESS_TOKEN;
class MercadoPagoController {
  public async checkout(req: Request, res: Response) {
    try {
      const datosBody = req.body;
      if (!datosBody) {
        throw new Error("No se ingresaron datos");
      } else {
        if (datosBody.productos && datosBody.back_urls) {
          let preference = {
            items: datosBody.productos,
            back_urls: datosBody.back_urls,
            auto_return: "approved",
          };
          if (!mercadoPagoAccessToken) {
            console.log("Error: access token not defined");
            process.exit(1);
          } else {
            mercadopago.configurations.setAccessToken(mercadoPagoAccessToken);
            mercadopago.preferences
              .create(preference)
              .then(function (response) {
                // console.log(response);
                let op = {
                  detail: response,
                  initPoint: response.body.init_point,
                };
                responder.sucess(req, res, op, "operacion exitosa", 200);
              })
              .catch(function (error) {
                console.log(error);
                responder.error(req, res, error, "Error interno del servidor", 500);
              });
          }
        }
      }
    } catch (error) {
      console.log(error);
      responder.error(req, res);
    }
  }
  public async prueba(req: Request, res: Response) {
    try {
      responder.sucess(req, res, "servidor mercaPago corriendo", "ok", 200);
    } catch (error) {
      console.log(error);
      responder.error(req, res);
    }
  }

  public async notificaciones(req: Request, res: Response) {
    try {
      const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;

      // ✔ Codigo de estado Ok(200) al servidor de MercadoPago para informar que recibimos la notificacion
      responder.sucess(req, res, "Ok", "Ok", 200);

      // ✔ data ---> Notificacion enviada por MercadoPago
      const notification = req.body;

      // ✔ Validamos que la notificación contenga datos
      if (!notification || Object.keys(notification).length === 0) {
        console.log("🟡 Notificación sin datos");
        console.log(`🟡 IP: ${ip}`);
        console.log(`🟡 Fecha y Hora: ${new Date()}`);
        return;
      }

      // ✔ Validamos que la notificación tenga ID de pago
      if (!notification.data.id || notification.data.id.trim().length === 0 || notification.data.id == "" ) {
        console.log("🟡 Notificación sin ID de pago, revisar JSON enviado por MercadoPago");
        console.log(`🟡 IP: ${ip}`);
        console.log(`🟡 Fecha y Hora: ${new Date()}`);
        return;
      }

      // ✔ paymentData ---> Informacion del pago en base al ID del pago (Obtenido por la notificacion)
      const URLPayment = `https://api.mercadopago.com/v1/payments/${notification.data.id}`;
      const paymentDataPromise = await fetch(URLPayment, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_SAMPLE_ACCESS_TOKEN}`,
        },
      });
      const paymentData = await paymentDataPromise.json();

      // ✔ Validamos que el Get a Payment de MercadoPago tenga datos
      if (!paymentData || Object.keys(paymentData).length === 0) {
        console.log("Pago obtenido sin datos, revisar información del pago traída por MercadoPago");
        console.log(`🟡 Fecha y Hora: ${new Date()}`);
        return;
      }

      // ✔ Desestructuracion de la notificación para quedarnos con los datos que nos interesan
      let {
        data: { id: payment_id },
        date_created,
      } = notification;

      // ✔ Desestructuracion de PaymentData
      let {
        currency_id,
        date_approved,
        date_last_updated,
        status,
        status_detail,
        additional_info: {
          items: [{ quantity, title, unit_price, description }],
        },
        payment_method: { id: payment_method_id, type: payment_method_type },
        card,
      } = paymentData;

      let CAPIData = {
        payment_id,
        date_created,
        quantity,
        title,
        unit_price,
        description,
        currency_id,
        date_approved,
        date_last_updated,
        status,
        status_detail,
        payment_method_id,
        payment_method_type,
        number: "",
        type: "",
        name: "",
      };

      // ✔ Validamos que el pago se haya hecho con tarjeta, caso contario, no se guardan esos datos.
      if (card && Object.keys(card).length !== 0) {
        const {
          card: {
            cardholder: {
              identification: { number, type },
              name,
            },
          },
        } = paymentData;

        CAPIData.number = number;
        CAPIData.type = type;
        CAPIData.name = name;
      }

      // ✔ Debug: Datos enviados a CAPI
      console.log("✔ Datos que se envían a cAPI");
      console.log(CAPIData);

      // 🔑 Obtenemos el token en CAPI, si corresponde a un pago de Comercio o Inmueble
      if (title.includes("Comercial") || title.includes("Inmueble")) {
        const URLCAPIToken = "https://api.municipiosanjuan.gob.ar/security/auth";
        const bodyToken = {
          username: "LD_Web",
          password: "aJXI!rG.73!8",
        };
        const responseToken = await fetch(URLCAPIToken, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyToken),
        });
        const responseTokenJson = await responseToken.json();

        // ✔ Enviamos data a CAPI para que haga la inserción en la base de datos
        const URLCAPIPost = "https://api.municipiosanjuan.gob.ar/v1/MercadoPago/CheckOut";
        await fetch(URLCAPIPost, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${responseTokenJson}`,
          },
          body: JSON.stringify(CAPIData),
        });
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
export const mercadoPagoController = new MercadoPagoController();
