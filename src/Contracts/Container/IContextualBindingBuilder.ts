import ContextualBindingBuilder from '@src/Container/ContextualBindingBuilder';

interface IContextualBindingBuilder {

    /**
     * Define the abstract target that depends on the context.
     *
     * @param {string} abstract
     * @returns {ContextualBindingBuilder}
     */
    needs(abstract: string): ContextualBindingBuilder;

    /**
     * Define the implementation for the contextual binding.
     *
     * @param {Function|string} implementation
     * @returns {void}
     */
    give(implementation: Function | string): void;

}

export default IContextualBindingBuilder;
