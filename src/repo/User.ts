import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Length } from "class-validator";
import { Thread } from "./Thread";
import { ThreadPoint } from "./ThreadPoint";
import { ThreadItemPoint } from "./ThreadItemPoint";
import { Auditable } from "./Auditable";
import { ThreadItem } from "./ThreadItem";

//El decorador Entity le dice a TypeORM que la clase que se va a definir es una entidad con el nombre User pluralizado
@Entity({ name: "Users" })

export class User extends Auditable {
    //identificación único. Esto es lo que indica PrimaryGeneratedColumn. El nombre del campo será id, en esta instancia el id no se capitaliza
    @PrimaryGeneratedColumn({
        name: "Id",
        type: "bigint"
    })
    id: string;

    //decorador Column se utiliza para definir el campo de la base de datos
    //Entonces, los decoradores se están utilizando para mapear nuestros objetos de código a las entidades de la base de datos
    @Column("varchar", {
        name: "Email",
        length: 120,
        unique: true,
        nullable: false,
    })
    email: string;

    @Column("varchar", {
        name: "UserName",
        length: 60,
        unique: true,
        nullable: false,
    })
    userName: string;

    @Column("varchar", {
        name: "Password",
        length: 100,
        nullable: false
    }) @Length(8, 100)
    password: string;

    @Column("boolean", {
        name: "Confirmed",
        default: false,
        nullable: false
    })
    confirmed: boolean;

    @Column("boolean", {
        name: "IsDisabled",
        default: false,
        nullable: false
    })
    isDisabled: boolean;

    /*
        El decorador OneToMany muestra que para cada usuario individual hay potencialmente múltiples subprocesos asociados Thread[], Esta 
        relacion tambien tiene que verse reflejada en la definicion de tipos de GraphQL para User quie es una representacion de la entidad

        aqui esta relacion va desde el User a  threadRelUser
        ##Thread entidad
        ##threadRelUse alias que se le da a la entidad con la cual me estoy relacionando(aqui hago referencia al user dentro de thread)
        ##threads nombre que le doy a la relacion que estoy definoendo de User a thread ancla

        Esta relacion se establece desde User hacia Thread referenciando al ancla user de Thread.js y desde Thread hacia 
        User referenciando en ancla thread desde User.js hacia Thread.js
    */
    @OneToMany(() => Thread, (threadRelUse) => threadRelUse.user) //threadRelUse.user es el anclaje de thread hacia user,.user esta definido en thread
    /*
        (threads: Thread[]): esta relacion representa un campo en la definicion de tipo de graphql(para User) llamada threads la cual es de tipo Thread[] 
        que representa la relacion con multiples thread asociados al mismo usuario(1 a n)

        ademas esta relacion representa un campo en la tabla de la BD Threads con nombre de userid de tipo FK, en donde un usuario puede terner multiples threads
    */
    threads: Thread[];//esta es el ancla de user a thread y que utilizo dentro de Thread.js para conectar con User.js eje: ...@ManyToOne(() => User, (user: User) => user.threads)

    @OneToMany(() => ThreadItem,(threadItem) => threadItem.user) 
    threadItems: ThreadItem[];

    @OneToMany(() => ThreadPoint, (threadPoint) => threadPoint.user) 
    threadPoints: ThreadPoint[];

    @OneToMany(() => ThreadItemPoint, (threadItemPoint) => threadItemPoint.user) 
    threadItemPoints: ThreadItemPoint[];

}

/*
Esta es la estructura que tomara la entidad a nivel de codigo javascript en donde la relacion se representa como array de las 
relaciones @OneToMany aqui definidas. Para el caso de la BD Sql estas relaciones son IDs y FKs()que representan la tabla dentro de las entidaddes correspondientes
y que el ORM de forma automatica los define segun estas configuraciones

estructura javascript: es inportante ercordar que esta estructura que maneja javascript es en la que se basara la definicion de tipos en GraphQL para las consultas y retornos de 
                       los ditintos tipos de datos(en este caso para el tipeo definido para usuario(type user))

type User {
    id: ID!
    email: String!
    userName: String!
    password: String!
    confirmed: Boolean!
    isDisabled: Boolean!
    threads: [Thread!] 
    threadItems: [ThreadItem!] 
    threadPoints: [ThreadPoint!]
    threadItemPoints:  [ThreadItemPoint]
    createdBy: String!
    reatedOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }



*/

