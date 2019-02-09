import Container from './Container';
import InstanceSharerContract from '../Contracts/Container/InstanceSharer';
import {Identifier} from '../types/container';

class InstanceSharer implements InstanceSharerContract {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The container's shared instances.
     *
     * @var {Map}
     */
    protected _instances: Map<any, any> = new Map;

    /**
     * Create a new class binding builder.
     *
     * @constructor
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Register an existing instance as shared in the container.
     *
     * @param {Identifier} abstract
     * @param {*} instance
     * @returns {*}
     */
    public instance<U, V>(abstract: Identifier<U>, instance: V): V {
        this._container.getAliaser().removeAbstractAlias<U>(abstract);

        const isBound = this._container.bound<U>(abstract);

        this._container.getAliaser().forgetAlias<U>(abstract);

        // We'll check to determine if this type has been bound before, and if
        // it has we will fire the rebound callbacks registered with the
        // container and it can be updated with consuming classes that have
        // gotten resolved here.
        this._instances.set(abstract, instance);

        if (isBound) this._container.rebound<U>(abstract);

        return instance;
    }

    /**
     * Determine if the container contains the given shared instance.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasInstance<T>(abstract: Identifier<T>): boolean {
        return this._instances.has(abstract);
    }

    /**
     * Delete the bindings for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetInstance<T>(abstract: Identifier<T>): void {
        this._instances.delete(abstract);
    }

    /**
     * Clear all of the instances from the container.
     *
     * @returns {void}
     */
    public forgetInstances(): void {
        this._instances.clear();
    }

    /**
     * Determine if the container contains the given shared instance.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasSharedInstance<T>(abstract: Identifier<T>): boolean {
        return this._instances.has(abstract);
    }

    /**
     * Get a shared instance from the container.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    public getSharedInstance<T>(abstract: Identifier<T>): any {
        return this._instances.get(abstract);
    }

    /**
     * Add a shared instance to the container.
     *
     * @param {Identifier} abstract
     * @param {*} implementation
     * @returns {void}
     */
    public addSharedInstance<T>(abstract: Identifier<T>, implementation: any): void {
        this._instances.set(abstract, implementation);
    }

}

export default InstanceSharer;
