import Container from './Container';
import IMethodBinder from '../Contracts/Container/IMethodBinder';
import {Instantiable} from '../types/container';

class MethodBinder implements IMethodBinder {

    /**
     * The container's method bindings.
     *
     * @var {Map}
     */
    protected _methodBindings: Map<string, Function> = new Map;

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * Create a new tagger.
     *
     * @constructor
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Determine if the container has a method binding.
     *
     * @param {string} method
     * @returns {boolean}
     */
    public hasMethodBinding(method: string): boolean {
        return !!this._methodBindings.has(method);
    }

    /**
     * Bind a callback to resolve with Container::call.
     *
     * @param {(Array|string)} method
     * @param {Function} callback
     * @returns {void}
     */
    public bindMethod<T>(method: [Instantiable<T>, string] | string, callback: Function): void {
        this._methodBindings.set(this._parseBindMethod(method), callback);
    }

    /**
     * Get the method binding for the given method.
     *
     * @param {string} method
     * @param {*} instance
     * @returns {*}
     */
    public callMethodBinding(method: string, instance: any): any {
        return (this._methodBindings as any).get(method)(instance, this);
    }

    /**
     * Get the method to be bound in class@method format.
     *
     * @param {(Array|string)} method
     * @returns {string}
     */
    protected _parseBindMethod<T>(method: [Instantiable<T>, string] | string): string {
        if (Array.isArray(method)) {
            return `${method[0].name}@${method[1]}`;
        }

        return method;
    }

}

export default MethodBinder;
