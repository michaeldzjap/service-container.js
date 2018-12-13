export interface Newable<T> {
    new (...args: any[]): T;
}

export interface Abstract<T> {
    prototype: T;
    name: string;
}

export type Class<T> = Newable<T> | Abstract<T>;

export type Identifier<T> = string | symbol | Class<T>;

export interface Binding {
    concrete: Function;
    shared: boolean;
}

export class Interface {

    public key: Symbol;

}
