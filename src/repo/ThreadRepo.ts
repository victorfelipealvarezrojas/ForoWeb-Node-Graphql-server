import {
  isThreadBodyValid,
  isThreadTitleValid,
} from "../common/validators/ThreadValidators";
import { QueryArrayResult, QueryOneResult } from "./QueryArrayResult";
import { Thread } from "./Thread";
import { ThreadItem } from "./ThreadItem";
import { ThreadCategory } from "./ThreadCategory";
import { User } from "./User";

/**********************************************************************************************************************************************************
   Nota: permite crear un nuevo thread y es de tipo QueryOneResult<Thread> que puede retornanr un mensaje o una entidad(en este caso retorna un mensaje)
**********************************************************************************************************************************************************/
export const createThread = async (
  userId: string | undefined | null,
  categoryId: string,
  title: string,
  body: string
): Promise<QueryOneResult<Thread>> => {
  const titleMsg = isThreadTitleValid(title);
  if (titleMsg) {
    return {
      messages: [titleMsg],
    };
  }

  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  if (!userId) {
    return {
      messages: ["El usuario no ha iniciado sesión."],
    };
  }

  const user = await User.findOne({
    id: userId,
  });

  const category = await ThreadCategory.findOne({
    id: categoryId,
  });

  if (!category) {
    return {
      messages: ["categoría no encontrada."],
    };
  }

  const thread = await Thread.create({
    title,
    body,
    user,
    category,
  }).save();

  if (!thread) {
    return {
      messages: ["No se pudo crear el hilo."],
    };
  }

  return {
    messages: [thread.id],
  };
};

export const getThreadById = async (
  id: string
): Promise<QueryOneResult<Thread>> => {
  console.log("ini");
  const thread = await Thread.findOne({
    where: {
      id,
    },
    relations: [
      "user",
      "threadItems",
      "threadItems.user",
      "threadItems.thread",
      "category",
    ],
  });

  console.log("fin", thread);

  if (!thread) {
    return {
      messages: ["Hilo no encontrado."],
    };
  }

  // extra sort
  if (thread.threadItems) {
    thread.threadItems.sort((a: ThreadItem, b: ThreadItem) => {
      if (a.createdOn > b.createdOn) return -1;
      if (a.createdOn < b.createdOn) return 1;
      return 0;
    });
  }

  return {
    entity: thread,
  };
};

/**********************************************************************************************************************************************************
   Nota: permite crear un nuevo thread y es de tipo getThreadsByCategoryId<Thread> que puede retornanr un mensaje o una entidad
**********************************************************************************************************************************************************/
export const getThreadsByCategoryId = async (
  categoryId: string
): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("th") //thread es un alias que se usa para representar la tabla
    .where(`th."categoryId" = :categoryId`, { categoryId }) //filtro por Id
    .leftJoinAndSelect("th.category", "category") //leftJoinAndSelect significa que queremos hacer una combinación izquierda de SQL, pero también queremos devolver la entidad relacionada
    .leftJoinAndSelect("th.threadItems", "threadItems") //las relacione slas defino con @OneToMany o @ManyToOne
    .leftJoinAndSelect("th.user", "user") //incorporo el uusario para que el modelo del typedef de graphql pueda deviolver los datos del user
    .orderBy("th.createdOn", "DESC")
    .getMany(); //devolver todos los articulos

  if (!threads || threads.length === 0) {
    return {
      messages: ["Temas de categoría no encontrados."],
    };
  }
  return {
    entities: threads, //retorno entidad
  };
};

/**********************************************************************************************************************************************************
   Nota: devuelve todos los hilos con sus sub hilos y categorias
**********************************************************************************************************************************************************/
export const getThreadsLatest = async (): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("th") //tabla principal
    .leftJoinAndSelect("th.category", "category") //con sus categorias
    .leftJoinAndSelect("th.threadItems", "threadItems")
    .leftJoinAndSelect("th.user", "user") //relacion que existe entre user y thread
    .orderBy("th.createdOn", "DESC")
    .take(10)
    .getMany(); //devolver todos los articulos

  if (!threads || threads.length === 0) {
    return {
      messages: ["Hilo no encontardo."],
    };
  }

  return {
    entities: threads,
  };
};
