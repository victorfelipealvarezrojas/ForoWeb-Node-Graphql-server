import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Length } from "class-validator";
import { User } from "./User";
import { Thread } from "./Thread";
import { ThreadItemPoint } from "./ThreadItemPoint";
import { Auditable } from "./Auditable";

@Entity({ name: "ThreadItems" })
export class ThreadItem extends Auditable {
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
    nullable: false,
  })
  points: number;

  @Column("boolean", {
    name: "IsDisabled",
    default: false,
    nullable: false,
  })
  isDisabled: boolean;

  @Column("varchar", {
    name: "Body",
    length: 2500,
    nullable: true,
  })
  @Length(10, 2500)
  body: string;

  //solo puede tener asociado un usuario, uso el relacionador OneToMany threads en user tabto para threaditem y thread
  @ManyToOne(() => User, (user) => user.threadItems) user: User; //se representa en esta misma tabla como FK

  //solo puede tener asociado un hilo
  @ManyToOne(() => Thread, (thread) => thread.threadItems) thread: Thread; //se repredenta en esta misma tabla como FK

  @OneToMany(() => ThreadItemPoint,(threadItemPoint) => threadItemPoint.threadItem) threadItemPoints: ThreadItemPoint[]; //no se representa aqui, se representa en ThreadItemPoint
}
