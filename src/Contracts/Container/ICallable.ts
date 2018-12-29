import {Instantiable, Instance} from '../../Support/types';

interface ICallable<T> {

    /**
     * The class definition or instance.
     *
     * @var {(Instantiable|Instance)}
     */
    target: Instantiable<T> | Instance<T>;

    /**
     * The method name.
     *
     * @var {(string|undefined)}
     */
    method: string | undefined;

    /**
     * If the method is static or not.
     *
     * @var {boolean}
     */
    isStatic: boolean;

    /**
     * Return the callable properties as an array.
     *
     * @returns {Array}
     */
    asArray(): [Instantiable<T> | Instance<T>, string | undefined, boolean];

    /**
     * Call the specified method on the specified target with the given array of
     * arguments.
     *
     * @param {Array} args
     * @returns {*}
     */
    call(args: any[]): any;

}

export default ICallable;
