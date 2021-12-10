import { getManager } from "typeorm";
import { ThreadItem } from "./ThreadItem";
import { ThreadItemPoint } from "./ThreadItemPoint";
import { User } from "./User";

/**********************************************************************************************************************************************************
   Nota: updateThreadItemPoint  permite incrementar y disminuir puntos de un sub hilo
   -> increment es un valor boolean que determina si se incrementa o decrementa un punto(like) es unico por usuario
**********************************************************************************************************************************************************/
export const updateThreadItemPoint = async (
  userId: string,
  threadItemId: string,
  increment: boolean
): Promise<string> => {
  if (!userId || userId === "0") {
    return "Usuario no esta autenticado";
  }

  let message = "Error al incrementar los puntos";
  const threadItem = await ThreadItem.findOne({
    where: { id: threadItemId },
    relations: ["user"],
  });

  if (threadItem!.user!.id === userId) {
    message =
      "Error: las usuarios no pueden incrementar su propio elemento de subproceso";
    return message;
  }

  const user = await User.findOne({ where: { id: userId } });

  const existingPoint = await ThreadItemPoint.findOne({
    where: {
      threadItem: { id: threadItemId },
      user: { id: userId },
    },
    relations: ["threadItem"],
  });


  await getManager().transaction(async (transactionEntityManager) => {
    if (existingPoint) {
      if (increment) {
        if (existingPoint.isDecrement) {
          await ThreadItemPoint.remove(existingPoint);
          threadItem!.points = Number(threadItem!.points) + 1;
          threadItem!.lastModifiedOn = new Date();
          await threadItem!.save();
        }
      } else {
        if (!existingPoint.isDecrement) {
          await ThreadItemPoint.remove(existingPoint);
          threadItem!.points = Number(threadItem!.points) - 1;
          threadItem!.lastModifiedOn = new Date();
          await threadItem!.save();
        }
      }
    } else {
      await ThreadItemPoint.create({
        threadItem,
        isDecrement: !increment,
        user,
      }).save();
      if (increment) {
        threadItem!.points = Number(threadItem!.points) + 1;
      } else {
        threadItem!.points = Number(threadItem!.points) - 1;
      }
      threadItem!.lastModifiedOn = new Date();
      await threadItem!.save();
    }

    message = `Puntos  ${
      increment ? "incrementados" : "decrementados"
    } de forma satisfactoria.`;
  });
  return message;
};
