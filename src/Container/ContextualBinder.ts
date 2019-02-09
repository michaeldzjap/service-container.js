import Container from './Container';
import ContextualBinderContract from '../Contracts/Container/ContextualBinder';
import NestedMap from '../Support/NestedMap/.';
import {isUndefined} from '../Support/helpers';
import {Identifier} from '../types/container';

class ContextualBinder implements ContextualBinderContract {

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

    /**
     * Add a contextual binding to the container.
     *
     * @constructor
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

        const manager = this._container.getAliaser();

        // Next we need to see if a contextual binding might be bound under an
        // alias of the given abstract type. So, we will need to check if any
        // aliases exist with this type and then spin through them and check for
        // contextual bindings on these.
        if (!manager.hasAbstractAlias(abstract)
            || (manager.hasAbstractAlias(abstract)
                && !manager.getAbstractAlias(abstract)!.length)) {
            return;
        }

        for (const alias of manager.getAbstractAlias(abstract) as any[]) {
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
        const builder = this._container.getBuilder();

        if (this._contextual.has([builder.getLatestBuild(), abstract])) {
            return this._contextual.get([builder.getLatestBuild(), abstract]);
        }
    }

}

export default ContextualBinder;
