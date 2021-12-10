//tipados genericos

//lo utilizo parav el retorno de mensajes o arreglos de entidades anonimas
export class QueryArrayResult<T> {
    constructor(public messages?: Array<string>, public entities?: Array<T>) { }
}

//lo utilizo parav el retorno de mensajes o entidades anonimas
export class QueryOneResult<T> {
    constructor(public messages?: Array<string>, public entity?: T) { }
}