export interface Newable<T> {
    new (...args: any[]): T;
}

export interface Abstract<T> {
    prototype: T;
    name: string;
}

export interface Instance<T extends {}> {
    constructor: Abstract<T>;
}

export type Instantiable<T> = Newable<T> | Abstract<T>;

export type Identifier<T> = string | symbol | Instantiable<T>;

export interface Binding {
    concrete: Function;
    shared: boolean;
}

export class Interface {

    public key: Symbol;

}
