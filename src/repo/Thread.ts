import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Length } from "class-validator";
import { User } from "./User";
import { ThreadItem } from "./ThreadItem";
import { ThreadPoint } from "./ThreadPoint";
import { ThreadCategory } from "./ThreadCategory";
import { Auditable } from "./Auditable";

@Entity({
  name: "Threads",
})
export class Thread extends Auditable {
  @PrimaryGeneratedColumn({
    name: "Id",
    type: "bigint",
  })
  id: string;

  @Column("int", {
    name: "Views",
    default: 0,
    nullable: false,
  })
  views: number;

  @Column("int", { 
    name: "Points", 
    default: 0, 
    nullable: false })
  points: number;

  @Column("boolean", {
    name: "IsDisabled",
    default: false,
    nullable: false,
  })
  isDisabled: boolean;

  @Column("varchar", {
    name: "Title",
    length: 150,
    nullable: false,
  })
  @Length(5, 150)
  title: string;

  @Column("varchar", {
    name: "Body",
    length: 2500,
    nullable: true,
  })
  @Length(10, 2500)
  body: string;

  /*
      El decorador ManyToOne muestra que cada hilo, de varios hilos, tiene solo un usuario asociado,
      relacion tambien tiene que verse reflejada en la definicion de tipos de GraphQL para User el cual es una representacion de la entidad
      (
          esta relacion se establece por medio de user.threads que es un ancla definida dentro del User.ts  hacia esta clase 
          y que al mismo tiempo representa la relacion dentro de la definiciond e tipos de graphql como  threads: [Thread!]  
      )
  */
  @ManyToOne(() => User, (user: User) => user.threads) //user.threads es el anclaje de thread hacia user, .threads esta definido en user
  user: User; //esta es el ancla de thread a user y la utilizo en User.js para conectarlo con esta clase eje desde user: ....@OneToMany(() => Thread, (threadRelUse) => threadRelUse.user) 
  
  @OneToMany(() => ThreadItem, (threadItems) => threadItems.thread) 
  threadItems: ThreadItem[];
  
  @OneToMany(() => ThreadPoint, (threadPoint) => threadPoint.thread) 
  threadPoints: ThreadPoint[]; 
  //CATEGORIA
  @ManyToOne(() => ThreadCategory, (threadCategory) => threadCategory.threads) 
  category: ThreadCategory; 
}
