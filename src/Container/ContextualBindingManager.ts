import Container from './Container';
import NestedMap from '../Support/NestedMap/.';
import {isUndefined} from '../Support/helpers';
import {Identifier} from '../Support/types';

class ContextualBindingManager {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The contextual binding map.
     *
     * @var {NestedMap}
     */
    protected _contextual: any = new NestedMap;

    /**
     * Create a new class binding builder.
     *
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    // /**
    //  * Determine if the container contains the given contextual binding.
    //  *
    //  * @param {*} concrete
    //  * @param {Identifier} abstract
    //  * @returns {boolean}
    //  */
    // public hasContextualBinding<T>(concrete: any, abstract: Identifier<T>): boolean {
    //     return this._contextual.has([concrete, abstract]);
    // }
    //
    // /**
    //  * Get a contextual binding from the container.
    //  *
    //  * @param {*} concrete
    //  * @param {Identifier} abstract
    //  * @returns {*}
    //  */
    // public getContextualBinding<T>(concrete: any, abstract: Identifier<T>): any {
    //     return this._contextual.get([concrete, abstract]);
    // }

    /**
     * Add a contextual binding to the container.
     *
     * @param {*} concrete
     * @param {Identifier} abstract
     * @param {*} implementation
     * @returns {void}
     */
    public addContextualBinding<T>(concrete: any, abstract: Identifier<T>,
        implementation: any): void {
        this._contextual.set(
            [concrete, this._container.getAlias<T>(abstract)], implementation
        );
    }

    /**
     * Get the contextual concrete binding for the given abstract.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    public getContextualConcrete<T>(abstract: Identifier<T>): any {
        const binding = this._findInContextualBindings(abstract);
        if (!isUndefined(binding)) return binding;

        // Next we need to see if a contextual binding might be bound under an
        // alias of the given abstract type. So, we will need to check if any
        // aliases exist with this type and then spin through them and check for
        // contextual bindings on these.
        if (!this._container.hasAbstractAlias(abstract)
            || (this._container.hasAbstractAlias(abstract)
                && !this._container.getAbstractAlias(abstract)!.length)) {
            return;
        }

        for (const alias of this._container.getAbstractAlias(abstract) as any[]) {
            const binding = this._findInContextualBindings<any>(alias);
            if (!isUndefined(binding)) return binding;
        }
    }

    /**
     * Find the concrete binding for the given abstract in the contextual
     * binding array.
     *
     * @param {Identifier} abstract
     * @returns {*}
     */
    protected _findInContextualBindings<T>(abstract: Identifier<T>): any {
        if (this._contextual.has([this._container.getLatestBuild(), abstract])) {
            return this._contextual.get([
                this._container.getLatestBuild(), abstract
            ]);
        }
    }

}

export default ContextualBindingManager;
