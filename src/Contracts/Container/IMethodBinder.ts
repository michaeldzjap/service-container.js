import {Instantiable} from '../../types/container';

interface IMethodBinder {

    /**
     * Determine if the container has a method binding.
     *
     * @param {string} method
     * @returns {boolean}
     */
    hasMethodBinding(method: string): boolean;

    /**
     * Bind a callback to resolve with Container::call.
     *
     * @param {(Array|string)} method
     * @param {Function} callback
     * @returns {void}
     */
    bindMethod<T>(method: [Instantiable<T>, string] | string, callback: Function): void;

    /**
     * Get the method binding for the given method.
     *
     * @param {string} method
     * @param {*} instance
     * @returns {*}
     */
    callMethodBinding(method: string, instance: any): any;

}

export default IMethodBinder;
