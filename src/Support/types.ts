export interface Instantiable<T> {
    new (...args: any[]): T;
}

export interface Instance<T extends {}> {
    constructor: Instantiable<T>;
}

export type Identifier<T> = string | symbol | Instantiable<T>;

export interface Binding {
    concrete: Function;
    shared: boolean;
}

export class Interface {

    public key?: Symbol;

}
