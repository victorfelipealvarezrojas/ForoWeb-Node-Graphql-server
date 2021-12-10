import express from "express";
import session from "express-session"; //estado de sesio para express
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { createConnection } from "typeorm"; //ORM que me permite mapear mis clases a entidades de ls BD
/*import { register, login, logout } from "./repo/UserRepo";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
} from "./repo/ThreadRepo";
import {
  createThreadItem,
  getThreadItemsByThreadId,
} from "./repo/ThreadItemRepo";*/
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import typeDefs from "./gql/typeDefs";
import resolvers from "./gql/resolvers";
import cors from "cors";
//import bodyParser from "body-parser";
//SET NODE_ENV=development

//importamos nuestro paquete dotenv y establecemos configuraciones predeterminadas.Esto es lo que permite que nuestro archivo .env se utilice en nuestro proyecto
require("dotenv").config();

//createConnection es una funciona asincrona y requiere un prefijo de espera. Entonces, tuvimos que envolverlo en una función asíncrona
const main = async () => {
  //Aquí, creamos una instancia de nuestro objeto de aplicación con express.
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
    })
  );

  const router = express.Router();

  //CNN con BD
  await createConnection();

  //El objeto redis es el cliente de nuestro servidor Redis que esta en docker
  const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
  });

  //hora hemos creado nuestra clase RedisStore y el objeto redisStore, que haremos el almacén de datos para nuestra sesión Express(contenedor de datos único para cada usuario que entra en nuestro sitio.).
  const RedisStore = connectRedis(session);
  const redisStore = new RedisStore({
    client: redis,
  });

  //Lectura y parseo del body
  app.use(express.json()); //me permite obtener los valores desde el body en el request
  //app.use(bodyParser.json());
  app.use(
    session({
      store: redisStore, //es donde agregamos nuestro objeto redisStore
      name: process.env.COOKIE_NAME,
      sameSite: "Strict", //indica que las cookies de otros dominios no están permitidas
      secret: process.env.SESSION_SECRET, //contraseña o identificación única para nuestra sesión específica.
      resave: false,
      saveUninitialized: false,
      //configura nuestra cookie que se guarda en los navegadores de los usuarios
      cookie: {
        //path: "/",
        httpOnly: true, //significa que la cookie no está disponible en JavaScript
        secure: false, //xq no estamos usando https
        maxAge: 1000 * 60 * 60 * 24,
      },
    } as any)
  );

  app.use(router);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
  });
  apolloServer.applyMiddleware({ app, cors: false });

  /*
    Hemos configurado nuestro objeto de enrutador / y nuestra única ruta, que es GET. Básicamente, 
    lo que estamos haciendo es tomar userid de la cadena de consulta de URL y luego establecer 
    el campo session.userid único(asignara el mismo id para esa sesion en el msimo navegador) de nuestro usuario con él. 
    También contamos cuántas veces se realizó la llamada para mostrar que la sesión se mantiene activa entre llamadas con el mismo id.
  */

  /*router.get("/", (req: any, res, next) => {
        if (!req.session!.userid) {
            req.session!.userid = req.query.userid;
            console.log("Userid is set");
            req.session!.loadedCount = 0;
        } else {
            req.session!.loadedCount = Number(req.session!.loadedCount) + 1;
        }

        res.send(
            `userid: ${req.session!.userid}, loadedCount: 
          ${req.session!.loadedCount}`
        );
    });*/

  /*router.get("/", (req, res, next) => {
    res.send("hello");
  });

  router.post("/register", async (req, res, next) => {
    try {
      console.log("params", req.body);
      const userResult = await register(
        req.body.email,
        req.body.userName,
        req.body.password
      );
      if (userResult && userResult.user) {
        res.send(`new user created, userId: ${userResult.user.id}`);
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (ex) {
      res.send(ex.message);
    }
  });

  router.post("/login", async (req: any, res, next) => {
    try {
      console.log("params", req.body);
      const userResult = await login(req.body.userName, req.body.password);
      if (userResult && userResult.user) {
        //establecer  el campo session.userid único del estado de sesio para express que se almacena en redis
        //req.session!.userid 
        req.session!.userId = userResult.user?.id;
        res.send(`user logged in, userId: ${req.session!.userId}`); //retorno el id de la sesion de express
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (ex) {
      res.send(ex.message);
    }
  });

  router.post("/logout", async (req: any, res, next) => {
    try {
      console.log("params", req.body);
      const msg = await logout(req.body.userName);
      if (msg) {
        req.session!.userId = null;
        res.send(msg);
      } else {
        next();
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/createthread", async (req: any, res, next) => {
    try {
      console.log("userId", req.session);
      console.log("body", req.body);
      const msg = await createThread(
        req.session!.userId, //esto es de la sesion de express y redis
        req.body.categoryId,
        req.body.title,
        req.body.body
      );
      res.send(msg);
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/thread", async (req, res, next) => {
    try {
      const threadResult = await getThreadById(req.body.id);

      if (threadResult && threadResult.entity) {
        res.send(threadResult.entity.title);
      } else if (threadResult && threadResult.messages) {
        res.send(threadResult.messages[0]);
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/threadsbycategory", async (req, res, next) => {
    try {
      const threadResult = await getThreadsByCategoryId(req.body.categoryId);

      if (threadResult && threadResult.entities) {
        let items = "";
        threadResult.entities.forEach((th) => {
          items += th.title + ", ";
        });
        res.send(items);
      } else if (threadResult && threadResult.messages) {
        res.send(threadResult.messages[0]);
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/createthreaditem", async (req: any, res, next) => {
    try {
      const msg = await createThreadItem(
        req.session!.userId, // notice this is from session!
        req.body.threadId,
        req.body.body
      );

      res.send(msg);
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/threadsitemsbythread", async (req, res, next) => {
    try {
      const threadItemResult = await getThreadItemsByThreadId(
        req.body.threadId
      );

      if (threadItemResult && threadItemResult.entities) {
        let items = "";
        threadItemResult.entities.forEach((ti) => {
          items += ti.body + ", ";
        });
        res.send(items);
      } else if (threadItemResult && threadItemResult.messages) {
        res.send(threadItemResult.messages[0]);
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });
*/
  //hacemos que nuestro servidor express escuche en el puerto 808, que es a lo que está configurado nuestro SERVER_PORT.
  //la cookie se crea en la primera carga, queda asociada al Id el cual se mantiene durante toda la sesion y no es modificalble
  //este id userid representa al usuario conectado de forma unica y se le sera asignado durante toda sus cesion
  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(`Server ready on port ${process.env.SERVER_PORT}`);
  });
};

main();
