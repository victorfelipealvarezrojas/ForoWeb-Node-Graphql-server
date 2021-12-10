import { gql } from "apollo-server-express";
/*
    typeDefs:
    Este archiovo contiene la definicion de tipos de graphql
    CON ESTO  DEFINO MI ESQUEMA(Schema) DE DATOS...definición de un tipo de dato, 
    o la definición de las formas de obtener e interactuar con ellos(DEFINEN LO QUE SE PUEDE HACER)
*/
const typeDefs = gql`
  ##Definimos un nuevo tipo escalar personalizado, Date, no esta disponible por defecto en GraphQL fechas y horas
  scalar Date

  ##se utilizará cuando se devuelvan errores o mensajes en lugar de entidades de nuestros resolutores
  type EntityResult {
    messages: [String!]
  }

  ##los nombres de los campos tienne que ser los mismos definidos en el modelo de typeORM para que al ejecutar una consulta graphQL
  type User {
    id: ID!
    email: String!
    userName: String!
    password: String!
    confirmed: Boolean!
    isDisabled: Boolean!
    threads: [Thread!] ##el usuario pude estar en multipels hilos o publicaciones(en la relacion @ManyToOne se asocia con este nombre)
    threadItems: [ThreadItem!] ##se relacion de 1 a varios con threadItems que estara aasociada a 1 solo usuario(en la relacion @ManyToOne se asocia con este nombre)
    createdBy: String!
    reatedOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  ##union que utilizare para maneja la informacion del user o un mensaje de error al momento de retornar la consulta
  ##la estructura de respuestas que devuleve esta union dentro del resolver tiene que ser igual a la que maneja el retorno de la promesa dentro del resolver
  ##para estos casos las promesas de los resolver devolveran el mismo tipo del modelo de la Bd asi que el tipado y nombres de campos que se usen en type User tienen que ser los mismos
  ##que se estan definiendo para las entidades del ORM
  union UserResult = User | EntityResult

  type Thread {
    id: ID!
    views: Int!
    points: Int!
    isDisabled: Boolean!
    title: String!
    body: String!
    user: User! ##relacion con un usuario especifico
    threadItems: [ThreadItem!] ##un hilo puede tener multipels respuestas
    category: ThreadCategory
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  ##este tipo puede representar un Thread o un EntityResult, pero no ambos al mismo tiempo
  union ThreadResult = Thread | EntityResult

  ##tipo para manejar arrelos de thread, tambien tendra una union para mensaje y entidad(entidad sera un array)
  type ThreadArray {
    threads: [Thread!]
  }

  ##este tipo puede representar un Thread[] o un EntityResult, pero no ambos al mismo tiempo
  union ThreadArrayResult = ThreadArray | EntityResult

  type ThreadItem {
    id: ID!
    views: Int!
    points: Int!
    isDisabled: Boolean!
    body: String!
    user: User! ##se relaciona con 1 usuario
    thread: Thread! ##se relaciona con 1 hilo, el principal de la publicacion
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  ##tipo para manejar arrelos de threadItems, tambien tendra una union para mensaje y entidad(entidad sera un array)
  type ThreadItemArray {
    threadItems: [ThreadItem!]
  }

  ##este tipo puede representar un ThreadItem[] o un EntityResult, pero no ambos al mismo tiempo
  union ThreadItemsArrayResult = ThreadItemArray | EntityResult

  type ThreadCategory {
    id: ID!
    name: String!
    description: String
    threads: [Thread!]!
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  type CategoryThread {
    threadId: ID!
    categoryId: ID!
    categoryName: String!
    title: String!
    titleCreatedOn: Date!
  }

  type Query {
    ##el resolver viene a buscar el ThreadResult aqui para determinar que devolvera
    getThreadById(id: ID!): ThreadResult ##conuslta que devuelve la unión ThreadResult de dos tipos(cual tipo retornar al momento de hacer la consulta se valida aqui gatillado por el resolver)
    getThreadsByCategoryId(categoryId: ID!): ThreadArrayResult! ##devuleve dos posibles resultados, un array de threads o un mensaje
    getThreadsLatest: ThreadArrayResult!
    getThreadItemsByThreadId(threadId: ID!): ThreadItemsArrayResult!
    getAllCategories: [ThreadCategory!]
    me: UserResult! ##esta mitation devolversa la informacion del usuario en sesion
    getTopCategoryThread: [CategoryThread!]
  }

  ##las mutaciones me permiten hacer modificacines en la data
  type Mutation {
    createThread(
      userId: ID!
      categoryId: ID!
      title: String!
      body: String!
    ): EntityResult
    createThreadItem(userId: ID!, threadId: ID!, body: String): EntityResult
    updateThreadPoint(threadId: ID!, increment: Boolean!): String!
    updateThreadItemPoint(threadItemId: ID!, increment: Boolean!): String!
    register(email: String!, userName: String!, password: String!): String!
    login(userName: String!, password: String!): String!
    logout(userName: String!): String!
    changePassword(newPassword: String!): String!
  }
`;

export default typeDefs;
