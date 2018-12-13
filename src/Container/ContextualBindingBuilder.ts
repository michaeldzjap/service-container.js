import Arr from '@src/Support/Arr';
import Container from './Container';
import IContextualBindingBuilder from '@src/Contracts/Container/IContextualBindingBuilder';

class ContextualBindingBuilder implements IContextualBindingBuilder {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The concrete instance.
     *
     * @var {string}
     */
    protected _concrete: any;

    /**
     * The abstract target.
     *
     * @var {string}
     */
    protected _needs: string;

    /**
     * Create a new contextual binding builder.
     *
     * @param {Container} container
     * @param {mixed} concrete
     */
    public constructor(container: Container, concrete: any) {
        this._concrete = concrete;
        this._container = container;
    }

    /**
     * Define the abstract target that depends on the context.
     *
     * @param {string} abstract
     * @returns {ContextualBindingBuilder}
     */
    public needs(abstract: string): ContextualBindingBuilder {
        this._needs = abstract;

        return this;
    }

    /**
     * Define the implementation for the contextual binding.
     *
     * @param {mixed} implementation
     * @returns {void}
     */
    public give<T>(implementation: T | Function): void {
        for (const concrete of Arr.wrap(this._concrete)) {
            this._container.addContextualBinding(
                concrete,
                this._needs,
                implementation
            );
        }
    }

}

export default ContextualBindingBuilder;
