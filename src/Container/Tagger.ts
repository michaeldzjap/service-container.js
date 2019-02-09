import Container from './Container';
import ITagger from '../Contracts/Container/ITagger';
import {wrap} from '../Support/Arr';
import {Identifier} from '../types/container';

class Tagger implements ITagger {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * All of the registered tags.
     *
     * @var {Map}
     */
    protected _tags: Map<string, any[]> = new Map;

    /**
     * Create a new tagger.
     *
     * @constructor
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Assign a set of tags to a given binding.
     *
     * @param {(Identifier[]|Identifier)} abstracts
     * @param {string[]} tags
     * @returns {void}
     */
    public tag<T>(abstracts: Identifier<T>[] | Identifier<T>, tags: string[]): void {
        for (const tag of tags) {
            if (!this._tags.has(tag)) this._tags.set(tag, []);

            for (const abstract of wrap(abstracts)) {
                this._tags.get(tag)!.push(abstract);
            }
        }
    }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {Array}
     */
    public tagged(tag: string): any[] {
        const results: any[] = [];

        if (this._tags.has(tag)) {
            for (const abstract of (this._tags as any).get(tag)) {
                results.push(this._container.make(abstract));
            }
        }

        return results;
    }

}

export default Tagger;
