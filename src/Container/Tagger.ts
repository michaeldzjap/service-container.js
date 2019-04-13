import Container from './Container';
import TaggerContract from '../Contracts/Container/Tagger';
import Generator from './Generator';
import {wrap} from '../Support/Arr';
import {Identifier} from '../types/container';

class Tagger implements TaggerContract {

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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._tags.get(tag)!.push(abstract);
            }
        }
    }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param {string} tag
     * @returns {(Array|IterableIterator)}
     */
    public tagged(tag: string): any[] | IterableIterator<any> {
        if (!this._tags.has(tag)) {
            return [];
        }

        return (
            new Generator(
                (function *generator(this: Tagger): IterableIterator<any> {
                    for (const abstract of (this._tags as any).get(tag)) {
                        yield this._container.make(abstract);
                    }
                }).bind(this),
                (this._tags as any).get(tag).length
            )
        ).getIterator();
    }

}

export default Tagger;
