import { isThreadBodyValid } from "../common/validators/ThreadValidators";
import { QueryArrayResult } from "./QueryArrayResult";
import { ThreadItem } from "./ThreadItem";
import { User } from "./User";
import { Thread } from "./Thread";

export const createThreadItem = async (
  userId: string | undefined | null,
  threadId: string,
  body: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  if (!userId) {
    return {
      messages: ["Usuario no iniciado."],
    };
  }
  const user = await User.findOne({
    id: userId,
  });

  const thread = await Thread.findOne({
   where:{
    id: threadId,
   },
   relations:[
    "user",
    "threadItems",
    "threadItems.user",
    "threadItems.thread",      
    "category",
   ],
  });

  if (!thread) {
    return {
      messages: ["Hilo no encontrado."],
    };
  }

  const threadItem = await ThreadItem.create({
    body,
    user,
    thread,
  }).save();

  if (!threadItem) {
    return {
      messages: ["Error al crear el hilo."],
    };
  }

  return {
      //en la vista luego de recibir el id redireccionara por medip del history
    messages: [`${threadItem.id}`],
  };
};

export const getThreadItemsByThreadId = async (
  threadId: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const threadItems = await ThreadItem.createQueryBuilder("ti")
    .where(`ti."threadId" = :threadId`, { threadId })
    .leftJoinAndSelect("ti.thread", "thread")
    .orderBy("ti.createdOn", "DESC")
    .getMany();

  if (!threadItems) {
    return {
      messages: ["ThreadItems of thread not found."],
    };
  }
  return {
    entities: threadItems,
  };
};
