import Container from './Container';
import {isInstantiable} from '../Support/helpers';

const handler = {
    get: (obj: Container, prop: string): any => {
        if (Reflect.has(obj.constructor, prop)) {
            return obj.constructor[prop];
        }

        if (Reflect.has(obj, prop)) {
            return obj[prop];
        }

        return obj.make(prop);
    },
    set: (obj: Container, prop: string, value: any, receiver: any): boolean => {
        const error = new Error('Cannot bind to an existing property.');

        if (Reflect.has(obj.constructor, prop)) {
            throw error;
        }

        if (Reflect.has(obj, prop)) {
            throw error;
        }

        obj.bind(
            prop,
            value instanceof Function && !isInstantiable(value)
                ? value
                : (): any => value
        );

        return true;
    }
};

class ContainerFactory {

    /**
     * Create a new container factory instance which return a container instance
     * wrapped inside a proxy instance.
     *
     * @constructor
     */
    public constructor() {
        return new Proxy(new Container, handler);
    }

}

export default ContainerFactory;
