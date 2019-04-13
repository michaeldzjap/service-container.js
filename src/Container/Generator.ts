class Generator {

    /**
     * The generator callback.
     *
     * @var {Function}
     */
    private _generator: Function;

    /**
     * The number of yield stages.
     *
     * @var {number}
     */
    private _length: number;

    /**
     * Create a new rewindable generator instance.
     *
     * @constructor
     * @param {Function} generator
     * @param {number} length
     */
    public constructor(generator: Function, length: number) {
        this._generator = generator;
        this._length = length;
    }

    /**
     * Get an iterator from the generator.
     *
     * @returns {IterableIterator}
     */
    public getIterator(): IterableIterator<any> {
        const iterable = this._generator();
        iterable.length = this._length;

        return iterable;
    }

    /**
     * Get the number of yield stages.
     *
     * @returns {number}
     */
    public get length(): number {
        return this._length;
    }

}

export default Generator;
