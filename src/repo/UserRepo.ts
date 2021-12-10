import { User } from "./User";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../common/validators/PasswordValidator";
import { isEmailValid } from "../common/validators/EmailValidator";

const saltRounds = 10; //saltRounds es para el cifrado de contraseñas

//es básicamente un envoltorio alrededor del objeto Usuario. Estamos usando este objeto como el tipo de retorno de nuestras funciones
export class UserResult {
  constructor(public messages?: Array<string>, public user?: User) {}
}

export const register = async (
  email: string,
  userName: string,
  password: string
): Promise<UserResult> => {
  const result = isPasswordValid(password);
  if (!result.isValid) {
    return {
      messages: [
        "Las contraseñas deben tener una longitud mínima de 8, 1 carácter superior, 1 número y 1 símbolo",
      ],
    };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailErrorMsg = isEmailValid(trimmedEmail);
  if (emailErrorMsg) {
    return {
      messages: [emailErrorMsg],
    };
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  //creo entidad usuario y la guardo en la Base de datos
  const userEntity = await User.create({
    email: trimmedEmail,
    userName,
    password: hashedPassword,
  }).save();

  userEntity.password = ""; // en blanco por seguridad, elimino ala contraseña de mi entidad anets de retornarla
  return {
    user: userEntity,
  };
};

export const login = async (
  userName: string,
  password: string
): Promise<UserResult> => {
  const user = await User.findOne({
    where: { userName },
  });

  if (!user) {
    return {
      messages: [userNotFound(userName)],
    };
  }

  if (!user.confirmed) {
    return {
      messages: [
        "El usuario aún no ha confirmado su correo electrónico de registro.",
      ],
    };
  }

  const passwordMatch = await bcrypt.compare(password, user?.password);
  if (!passwordMatch) {
    return {
      messages: ["La contraseña no es válida."],
    };
  }

  return {
    user: user,
  };
};

export const logout = async (userName: string): Promise<string> => {
  const user = await User.findOne({
    where: { userName },
  });

  if (!user) {
    return userNotFound(userName);
  }

  return "El usuario se desconectó.";
};

export const changePassword = async (id: string, newPassword: string): Promise<string> => {
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return "Usuario no encontrado.";
  }

  if (!user.confirmed) {
    return  "El usuario aún no ha confirmado su correo electrónico de registro.";
  }

  //encripno la nueva contraseña y actualizo la entidad
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.save();
  return "La Contraseña fue actualizada.";
};

function userNotFound(userName: string) {
  return `Usuario con nombre de usuario ${userName} no fue encontrado.`;
}

export const me = async (id: string): Promise<UserResult> => {
  //el objeto de usuario que encontramos incluye los subprocesos y ThreadItems que pertenecen al usuario. Los usaremos en nuestra pantalla UserProfile:
  const user = await User.findOne({
    where: { id },
    relations: [
      "threads",//relacion de user con threads
      "threads.threadItems",//relacion de thread con threadItems
      "threadItems",
      "threadItems.thread",

    ], //subprocesos y ThreadItems que pertenecen al usuario
  });
  if (!user) {
    return { messages: ["Usuario no encontrado."] };
  }
  if (!user.confirmed) {
    return {
      messages: [
        "El usuario aún no ha confirmado su correo electrónico de registro.",
      ],
    };
  }
  return {
    user: user,
  };
};
