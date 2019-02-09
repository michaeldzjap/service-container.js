import Container from './Container';
import ContextualBindingBuilderContract from '../Contracts/Container/ContextualBindingBuilder';
import {wrap} from '../Support/Arr';
import {isUndefined} from '../Support/helpers';

class ContextualBindingBuilder implements ContextualBindingBuilderContract {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The concrete instance.
     *
     * @var {*}
     */
    protected _concrete: any;

    /**
     * The abstract target.
     *
     * @var {(string|undefined)}
     */
    protected _needs?: string;

    /**
     * Create a new contextual binding builder.
     *
     * @constructor
     * @param {Container} container
     * @param {*} concrete
     */
    public constructor(container: Container, concrete: any) {
        this._concrete = concrete;
        this._container = container;
    }

    /**
     * Define the abstract target that depends on the context.
     *
     * @param {string} abstract
     * @returns {this}
     */
    public needs(abstract: string): this {
        this._needs = abstract;

        return this;
    }

    /**
     * Define the implementation for the contextual binding.
     *
     * @param {(*|Function)} implementation
     * @returns {void}
     */
    public give<T>(implementation: T | Function): void {
        if (isUndefined(this._needs)) {
            throw new Error('The abstract target is undefined.');
        }

        for (const concrete of wrap(this._concrete)) {
            this._container
                .getContextualBinder()
                .addContextualBinding(
                    concrete,
                    this._needs,
                    implementation
                );
        }
    }

}

export default ContextualBindingBuilder;
