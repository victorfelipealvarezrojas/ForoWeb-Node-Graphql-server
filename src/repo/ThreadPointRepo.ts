import { getManager } from "typeorm";
import { Thread } from "./Thread";
import { ThreadPoint } from "./ThreadPoint";
import { User } from "./User";

/**********************************************************************************************************************************************************
   Nota: updateThreadPoint  permite incrementar y disminuir puntos
   -> increment es un valor boolean que determina si se incrementa o decrementa un punto(like)
**********************************************************************************************************************************************************/
export const updateThreadPoint = async (userId: string, threadId: string, increment: boolean): Promise<string> => {
  // todo: tengo que validar que el usuario se encuentre autenticado 
  let message = "No se pudo incrementar el punto del hilo";

  //obtengo el hilo relacionado al threadId de las props
  const thread = await Thread.findOne({
    where: { id: threadId },
    relations: ["user"],
  });

  //verifico que el usuario de las props no es el mismo dueño del hilo, el mismo usuario no puede aumentar sus puntos
  if (thread!.user!.id === userId) {
    message = "Error: las usuarios no pueden incrementar su propio hilo";
    return message;
  }

  //aqui obtengo el usuario que esta realizando la peticion, usuario autenticado
  const user = await User.findOne({ where: { id: userId } });

  //Aquí, estamos viendo si ya existe un registro en la entidad ThreadPoint asociado al hilo y usuario. Usaremos este objeto para tomar decisiones sobre cómo agregar o eliminar puntos 
  //obtengo la puntuacion del hilo y usuario que llega en las props(con esto deetrmino si es like o des-like)
  const existingPoint = await ThreadPoint.findOne({
    where: { thread: { id: threadId }, user: { id: userId } },
    relations: ["thread"],
  });

  //La llamada a la transacción getManager(). Está creando una transacción SQL. Una transacción es una forma de realizar múltiples operaciones SQL como una sola operación.
  //(cada uno se completará con éxito o todos fallarán)
  await getManager().transaction(async (transactionEntityManager) => {
    //En esta sección, verificamos si un ThreadPoint ya existe verificando un punto existente (recuerde que un ThreadPoint puede representar un punto positivo o negativo que se registra tambien en thread)
    if (existingPoint) {
      //si el incremento de las props es true tengo que modificar el total de thread
      if (increment) {
        //valido el campo isDecrement de la entidad es verdadero en la BD
        if (existingPoint.isDecrement) {
           //si es verdadero elimino el punto existente y sumo un punto al hilo principal
          await ThreadPoint.remove(existingPoint);
          thread!.points = Number(thread!.points) + 1;
          thread!.lastModifiedOn = new Date();//actualizo fecha de modificacion
          await thread!.save();
        }
      } else {//si el incremento de las props es false
        //valido el campo isDecrement de la entidad es falso en la BD
        if (!existingPoint.isDecrement) {
          //si es falso elimino el punto existente y resto un punto al (thread)hilo principal
          await ThreadPoint.remove(existingPoint);
          thread!.points = Number(thread!.points) - 1;
          thread!.lastModifiedOn = new Date();//actualizo fecha de modificacion
          await thread!.save();
        }
      }
    } else {
      //De lo contrario, si no tenemos puntos existentes en absoluto, simplemente creamos uno nuevo que es un incremento o un decremento:
      //creo un nuevo punto asociado al usuario y el hilo, el TypeORM recive le objeto/entidad entera para realizar la actualizacion 
      await ThreadPoint.create({
        thread,
        isDecrement: !increment,
        user,
      }).save();

      if (increment) {
        thread!.points = Number(thread!.points) + 1;
      } else {
        thread!.points = Number(thread!.points) - 1;
      }
      //registro el nuevo punto que puede ser + o -
      thread!.lastModifiedOn = new Date();
      await thread!.save();
    }
    message = `Se realizo con exito el ${
      increment ? "incremento" : "decremento"
    } de puntos.`;
  });
  return message;
};
