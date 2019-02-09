interface Abstract<T> {
    prototype: T;
    name: string;
}

export interface Instantiable<T> {
    new (...args: any[]): T;
}

export interface Instance<T extends {}> {
    constructor: Abstract<T>;
}

export type Identifier<T> = string | symbol | Instantiable<T>;

export interface Binding {
    concrete: Function;
    shared: boolean;
}
