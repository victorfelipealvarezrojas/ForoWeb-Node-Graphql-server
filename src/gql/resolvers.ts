import { IResolvers } from "apollo-server-express";
import { QueryArrayResult, QueryOneResult } from "../repo/QueryArrayResult";
import { Thread } from "../repo/Thread";
import { ThreadCategory } from "../repo/ThreadCategory";
import { getAllCategories } from "../repo/ThreadCategoryRepo";
import { ThreadItem } from "../repo/ThreadItem";
import { updateThreadItemPoint } from "../repo/ThreadItemPointRepo";
import CategoryThread from "../repo/CategoryThread";
import { getTopCategoryThread } from "../repo/CategoryThreadRepo";
import {
  createThreadItem,
  getThreadItemsByThreadId,
} from "../repo/ThreadItemRepo";
import { updateThreadPoint } from "../repo/ThreadPointRepo";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
  getThreadsLatest,
} from "../repo/ThreadRepo";
import { User } from "../repo/User";
import {
  changePassword,
  login,
  logout,
  me,
  UserResult,
} from "../repo/UserRepo";
import { GqlContext } from "./GqlContext";

/*
    ######################################################################################################
    Los resolvers son las funciones que obtienen o editan los datos de nuestro 
    almacén de datos y estos datos se comparan con la definición de tipo GraphQL 
    del archivo typeDefs.js(definicion de tipos).
    #######################################################################################################
    Al usar TypeScript, usamos tipos para representar nuestros objetos devueltos,
    y eso es lo que representan typeDefs.ts o la definicion de tipos. 
    GraphQL hará coincidir estos tipos con los tipos GraphQL del mismo nombre del archivo typeDefs.ts
    #######################################################################################################
*/

//EntityResult sera el tipo de retorno para errores y mensajes de estado. Además, este mapeo de tipos esiste tambien en el archivo typeDefs de definicion de tipos
interface EntityResult {
  messages: Array<string>;
}

const resolvers: IResolvers = {
  /*
    ******************LOS __resolveType EXISTEN EN TYPEDEFS COMOM TIPO DE RESPUESTA****************************************
    es necesario especificar el tipo de dato que retornara(puede ser menssages o una entidad) y esta es una forma
    el ThreadResult esta definido en el typedef definicion de tipos para la funcion getThreadById y es una union 
    entre dos tipos y en ella determino cual devolver
    ThreadResult es la unión que representa los dos tipos, Thread y EntityResult, en GraphQL
    Este resolver se da cuenta cuando un ThreadResult está a punto de ser devuelto y determina de qué tipo es internamente
*/
  UserResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      //la estructura de lo que devulve la consulta graphql y la entidad de el typeORM tienen que ser iguales(user de repo y type User de typedefs)
      if (obj.messages) {
        return "EntityResult";
      }
      return "User";
    },
  },
  ThreadResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      //aquí hemos usado una simple verificación para el campo de mensaje del tipo EntityResult al verificar obj.message:
      if (obj.messages) {
        return "EntityResult"; //EntityResult interface que reprecenta el retorno de los errores
      }
      return "Thread"; //entidad de datos
    },
  },
  ThreadArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadArray";
    },
  },
  ThreadItemsArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadItemArray";
    },
  },
  Query: {
    //metodo de consulta thread por id que retorna un a promesa de tipo Thread(entidad con sus registros) o EntityResult(messages del error)...puede retornar dos valores distintos,
    //al momento de solicitar los datos consumiendo esta query tengo que especificar esos dos posibles valores con (...on) ver "eje query" al final del documento
    getThreadById: async (
      obj: any,
      args: { id: string }, //parametro de entrada
      ctx: GqlContext,
      info: any
    ): Promise<Thread | EntityResult> => {
      try {
        console.log("llego")
        //QueryOneResult retorna una entidad o un mnesaje de error(messages) y la entidad es anonima <T>
        let thread: QueryOneResult<Thread> = await getThreadById(args.id);
        //retorno el resultado en caso de que thread.entity contenga informacion y finaliza
        if (thread.entity) {
          return thread.entity;
        }

        return {
          messages: thread.messages ? thread.messages : ["test"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadsByCategoryId: async (
      obj: any,
      args: { categoryId: string },
      ctx: GqlContext,
      info: any
    ): Promise<{ threads: Array<Thread> } | EntityResult> => {
      let threads: QueryArrayResult<Thread>;
      try {
        threads = await getThreadsByCategoryId(args.categoryId);
        if (threads.entities) {
          return {
            threads: threads.entities,
          };
        }
        return {
          messages: threads.messages ? threads.messages : ["Ocurrio un Error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadsLatest: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<{ threads: Array<Thread> } | EntityResult> => {
      let threads: QueryArrayResult<Thread>;
      try {
        threads = await getThreadsLatest();
        if (threads.entities) {
          return {
            threads: threads.entities,
          };
        }
        return {
          messages: threads.messages ? threads.messages : ["Ocurrio un Error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadItemsByThreadId: async (
      obj: any,
      args: { threadId: string },
      ctx: GqlContext,
      info: any
    ): Promise<{ threadItems: Array<ThreadItem> } | EntityResult> => {
      try {
        let threadItems: QueryArrayResult<ThreadItem>;//representa el mismo retorno definido para typedef de esta consulta graphql ThreadArrayResult
        threadItems = await getThreadItemsByThreadId(args.threadId);
        if (threadItems.entities) {
          return {
            threadItems: threadItems.entities,
          };
        }
        return {
          messages: threadItems.messages
            ? threadItems.messages
            : ["Ocurrio un Error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getAllCategories: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<Array<ThreadCategory> | EntityResult> => {
      let categories: QueryArrayResult<ThreadCategory>;
      try {
        categories = await getAllCategories();
        if (categories.entities) {
          return categories.entities;
        }
        return {
          messages: categories.messages
            ? categories.messages
            : ["Ocurrio un Error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    //la estructura de lo que devulve la consulta graphql y la entidad de el typeORM tienen que ser iguales(user de repo y type User de typedefs)
    //esta consulta retornara una Promise<User | EntityResult> y ese User que es de la carpeta repo(entidad) tiene que ser igual que el user que devolvera esta funcion
    //y que esta definido en el archivo typeDefs.js debido a que el retorno de (me) se encuentra definido en el(typeDefs.js), pero al mismo tiempo esta funcion
    //retornara un tipo User definido en el modelo
    me: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<User | EntityResult> => {
      //me: async... tiene definido su retorno en typeDefs, y esta promesa(dos caras de la misma moneda) define tambien su retorno y ambnos tienen que coincidir
      //xq esto es lo que devolvera la consulta graphql y es una extencion de lo mismo(no pueden ser distintas)
      let user: UserResult;//esta definido dentro de TypeDef y tiene que ser igual a la estructura del modelo de datos para User.ts
      try {
        if (!ctx.req.session?.userId) {
          return {
            messages: ["Usuario no ha iniciado sesion."],
          };
        }
        //obtiene los datos del usuario en sesion(id de usuario almacenado en cache mas sus threas y threadItems)
        user = await me(ctx.req.session.userId);
        if (user && user.user) {
          return user.user;
        }
        return {
          messages: user.messages
            ? user.messages
            : ["Se ha producido un error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getTopCategoryThread: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<Array<CategoryThread>> => {
      try {
        return await getTopCategoryThread();
      } catch (ex) {
        console.log(ex.message);
        throw ex;
      }
    },
  },
  Mutation: {
    createThread: async (
      obj: any,
      args: {
        userId: string;
        categoryId: string;
        title: string;
        body: string;
      },
      ctx: GqlContext,
      info: any
    ): Promise<EntityResult> => {
      //QueryOneResult lo utilizo para el retorno de mensajes o entidades
      let result: QueryOneResult<Thread>;
      console.log("args.body",args.body)
      try {
        result = await createThread(
          args.userId,
          args.categoryId,
          args.title,
          args.body
        );
        return {
          messages: result.messages
            ? result.messages
            : ["Se ha producido un error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    createThreadItem: async (
      obj: any,
      args: { userId: string; threadId: string; body: string },
      ctx: GqlContext,
      info: any
    ): Promise<EntityResult> => {
      let result: QueryOneResult<ThreadItem>;
      try {
        console.log("args.body",args.body)
        result = await createThreadItem(args.userId, args.threadId, args.body);
        return {
          messages: result.messages
            ? result.messages
            : ["Se ha producido un error"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    updateThreadPoint: async (
      obj: any,
      args: { threadId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<String> => {
      let result: string;
      try {
        if (!ctx.req.session || !ctx.req.session?.userId) {
          return "Debes iniciar sesión para establecer Me gusta.";
        }
        result = await updateThreadPoint(
          ctx.req.session?.userId,//obtengo el usuario en cesion para la instancia del cliente de la peticion, este usuario esta en memoria caché(redis)
          args.threadId,
          args.increment
        );
        return result;
      } catch (ex) {
        throw ex;
      }
    },
    updateThreadItemPoint: async (
      obj: any,
      args: { threadItemId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<String> => {
      let result: string;
      try {
        if (!ctx.req.session || !ctx.req.session?.userId) {
          return "Debes iniciar sesión para establecer Me gusta.";
        }
        result = await updateThreadItemPoint(
          ctx.req.session?.userId,
          args.threadItemId,
          args.increment
        );
        return result;
      } catch (ex) {
        throw ex;
      }
    },
    login: async (
      obj: any,
      args: {
        userName: string;
        password: string;
      },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let user: UserResult;
      try {
        user = await login(args.userName, args.password);
        if (user && user.user) {
          ctx.req.session!.userId = user.user.id;

          return `Login realizado para el usuario ${
            ctx.req.session!.userId
          }.${JSON.stringify(ctx.req.session)}`;
        }
        return user && user.messages
          ? user.messages[0]
          : "Se ha producido un error";
      } catch (ex) {
        throw ex;
      }
    },
    logout: async (
      obj: any,
      args: { userName: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      try {
        let result = await logout(args.userName);
        //destroy establece la sesion a undefined
        ctx.req.session?.destroy((err: any) => {
          if (err) {
            return;
          }
        });
        return result;
      } catch (ex) {
        throw ex;
      }
    },
    changePassword: async (
      obj: any,
      args: { newPassword: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      try {
        if (!ctx.req.session || !ctx.req.session!.userId) {
          return "Debe haber iniciado sesión para poder cambiar su contraseña.";
        }
        let result = await changePassword(
          ctx.req.session!.userId,
          args.newPassword
        );

        return result;
      } catch (ex) {
        throw ex;
      }
    },
  },
};

export default resolvers;

/*
  NOTA: dado que nuestra llamada podría devolver dos tipos diferentes(EntityResult,Thread), usamos la sintaxis ...on en la consulta
  eje query : consulta getThreadById
              query{
                    ##nombre del query del resolver el cual entrega dos posibles valores (... on EntityResult o ... on Thread)
                    getThreadById(id:1){
                      ... on EntityResult {
                        ##mensaje de error en caso de ocurrir uno 
                        messages
                      }

                      ... on Thread {
                        ##en casod e ser todo ok y encontrarlo
                        id
                        isDisabled
                        title
                        ###puedo seguir especificando los campos del typeDefs que quiero solicitar
                        
                      }
                    }
               }
               
  eje Mutation :
              mutation{
                    createThread(userId:1,categoryId:1,title: "titulo",body:"cuerpecito"){
                      ##esta mutacion solo retornara un mensaje y no entidad
                      ... on EntityResult {
                        messages
                      }
                    }
               }
*/
