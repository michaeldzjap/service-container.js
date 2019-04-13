import {Identifier} from '../../types/container';

interface Tagger {

    /**
     * Assign a set of tags to a given binding.
     *
     * @param {(Identifier[]|Identifier)} abstracts
     * @param {string[]} tags
     * @returns {void}
     */
    tag<T>(abstracts: Identifier<T>[] | Identifier<T>, tags: string[]): void;

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {(Array|IterableIterator)}
     */
    tagged(tag: string): any[] | IterableIterator<any>;

}

export default Tagger;
