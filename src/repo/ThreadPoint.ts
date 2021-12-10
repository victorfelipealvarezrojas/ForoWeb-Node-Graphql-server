import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Auditable } from "./Auditable";
import { Thread } from "./Thread";
import { User } from "./User";

@Entity({ name: "ThreadPoints" })

export class ThreadPoint extends Auditable {  
    @PrimaryGeneratedColumn({ 
        name: "Id", 
        type: "bigint" 
    })  
    id: string;  
    
    //si el campo isDecrement es verdadero, esto constituye un disgusto. 
    //Esto significa que los puntos tienen tres estados posibles: ningún punto, un me gusta o un disgusto.
    @Column("boolean", { 
        name: "IsDecrement", 
        default: false, 
        nullable: false 
    })  
    isDecrement: boolean;  
    
    /*CLAVES FORANEAS, estas claves se representan en la misma entidad como FK a las tablas User y Thread */
    // el punto e spara un usuario y subpropceso en especifico
    @ManyToOne(() => User, (user) => user.threadPoints)  user: User; //FK que se representara en esta misma entidad
    @ManyToOne(() => Thread, (thread) => thread.threadPoints)  thread: Thread;//FK que se representara en esta misma entidad


}