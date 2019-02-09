import ContextualBindingBuilderImpl from '../Container/ContextualBindingBuilder';

interface ContextualBindingBuilder {

    /**
     * Define the abstract target that depends on the context.
     *
     * @param {string} abstract
     * @returns {this}
     */
    needs(abstract: string): ContextualBindingBuilderImpl;

    /**
     * Define the implementation for the contextual binding.
     *
     * @param {(Function|string)} implementation
     * @returns {void}
     */
    give(implementation: Function | string): void;

}

export default ContextualBindingBuilder;
