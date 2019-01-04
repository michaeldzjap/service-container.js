import {first, last, shuffle, where, wrap} from './Arr';
import {isArrayable} from '../Contracts/IArrayable';
import {isObjectable} from '../Contracts/IObjectable';
import {isJsonable} from '../Contracts/IJsonable';
import {isJsonSerializable} from '../Contracts/IJsonSerializable';
import {isObject, isString, isUndefined, isInstance, dataGet, value} from './helpers';
import {Instantiable} from './types';

class Collection {

    /**
     * The items contained in the collection.
     *
     * @var {(Array|Object)}
     */
    protected _items: unknown[] | object;

    /**
     * Create a new collection.
     *
     * @param {*} items
     */
    public constructor(items: unknown = []) {
        this._items = this._getArrayableItems(items);
    }

    /**
     * Create a new collection instance if the value isn't one already.
     *
     * @param {*} items
     * @returns {Collection}
     */
    public static make(items: unknown[] | object | Collection = []): Collection {
        return new Collection(items);
    }

    /**
     * Wrap the given value in a collection if applicable.
     *
     * @param {*} value
     * @returns {Collection}
     */
    public static wrap(value: unknown): Collection {
        return value instanceof Collection
            ? new Collection(value)
            : new Collection(wrap(value));
    }

    /**
     * Get the underlying items from the given collection if applicable.
     *
     * @param {(Array|Object|Collection)} value
     * @returns {(Array|Object)}
     */
    public static unwrap(value: unknown[] | object | Collection): unknown[] | object {
        return value instanceof Collection ? value.all() : value;
    }

    /**
     * Create a new collection by invoking the callback a given amount of times.
     *
     * @param {number} number
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public static times(number: number, callback?: Function): Collection {
        if (number < 1) {
            return new Collection;
        }

        if (isUndefined(callback)) {
            return new Collection(
                Array.from(
                    Array(number), (x: undefined, i: number): number => i + 1
                )
            );
        }

        return (
            new Collection(
                Array.from(
                    Array(number), (x: undefined, i: number): number => i + 1
                )
            )
        ).map(callback);
    }

    /**
     * Get an array iterator for the items.
     *
     * @param {Array} items
     * @returns {Function}
     */
    private static _getArrayIterator(items: unknown[]): IterableIterator<unknown> {
        return (function *generator(): IterableIterator<unknown> {
            for (let i = 0; i < items.length; i++) {
                yield items[i];
            }
        })();
    }

    /**
     * Get an array iterator for the items.
     *
     * @param {Object} items
     * @returns {Function}
     */
    private static _getObjectIterator(items: object): IterableIterator<unknown> {
        return (function *generator(): IterableIterator<unknown> {
            for (const key of Object.keys(items)) {
                yield items[key];
            }
        })();
    }

    /**
     * Run a filter over each of the items.
     *
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public filter(callback?: Function): Collection {
        if (!isUndefined(callback)) {
            return new Collection(where(this._items, callback));
        }

        const items = Array.isArray(this._items)
            ? this._items.filter((value: unknown): boolean => !!value)
            : Object.keys(this._items).filter((key: string): boolean => !!this._items[key]);

        return new Collection(items);
    }

    /**
     * Filter items by the given key value pair.
     *
     * @param {string} key
     * @param {(string|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {Collection}
     */
    public where(key: string, operator?: unknown, value?: unknown): Collection {
        return this.filter(this._operatorForWhere(key, operator, value));
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     *
     * @param {string} key
     * @param {*} value
     * @returns {Collection}
     */
    public whereStrict(key: string, value: unknown): Collection {
        return this.where(key, '===', value);
    }

    /**
     * Filter items by the given key value pair.
     *
     * @param {string} key
     * @param {Array} values
     * @param {boolean} strict
     * @returns {Collection}
     */
    public whereIn(key: string, values: unknown[], strict: boolean = false): Collection {
        const items = this._getArrayableItems(values) as unknown[];

        return this.filter((item: unknown): boolean => {
            return strict
                ? items.includes(dataGet(item, key))
                : !isUndefined(values.find((_: unknown): boolean => dataGet(item, key) == _)); // eslint-disable-line eqeqeq
        });
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     *
     * @param {string} key
     * @param {Array} values
     * @returns {Collection}
     */
    public whereInStrict(key: string, values: unknown[]): Collection {
        return this.whereIn(key, values, true);
    }

    /**
     * Filter the items, removing any items that don't match the given type.
     *
     * @param {Instantiable} type
     * @returns {Collection}
     */
    public whereInstanceOf<T>(type: Instantiable<T>): Collection {
        return this.filter((value: unknown): boolean => value instanceof type);
    }

    /**
     * Get all of the items in the collection.
     *
     * @returns {(Array|Object)}
     */
    public all(): unknown[] | object {
        return this._items;
    }

    /**
     * Run a map over each of the items.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public map(callback: Function): Collection {
        if (Array.isArray(this._items)) {
            return new Collection(
                this._items.map(
                    (value: unknown, index: number, array: unknown[]): unknown => (
                        callback(value, index, array)
                    )
                )
            );
        }

        const keys = Object.keys(this._items);
        const items = keys.reduce((acc: object, key: string): object => {
            acc[key] = callback(this._items[key], key, this._items);

            return acc;
        }, {});

        return new Collection(items);
    }

    /**
     * Get the first item from the collection.
     *
     * @param {?(Function|undefined)} callback
     * @param {(*|undefined)} dflt
     * @returns {*}
     */
    public first(callback?: Function | null, dflt?: unknown): unknown {
        return first(this._items, callback, dflt);
    }

    /**
     * Get the first item by the given key value pair.
     *
     * @param {string} key
     * @param {string} operator
     * @param {*} value
     * @returns {*}
     */
    public firstWhere(key: string, operator: string, value?: unknown): unknown {
        return this.first(this._operatorForWhere(key, operator, value));
    }

    /**
     * Get the last item from the collection.
     *
     * @param {?(Function|undefined)} callback
     * @param {(*|undefined)} dflt
     * @returns {*}
     */
    public last(callback?: Function | null, dflt?: unknown): unknown {
        return last(this._items, callback, dflt);
    }

    /**
     * Get and remove the last item from the collection.
     *
     * @returns {*}
     */
    public pop(): unknown {
        if (Array.isArray(this._items)) {
            return this._items.pop();
        }

        const keys = Object.keys(this._items);
        const lastItem = this._items[keys[keys.length - 1]];
        delete this._items[keys[keys.length - 1]];

        return lastItem;
    }

    /**
     * Determine if the collection is empty or not.
     *
     * @returns {boolean}
     */
    public isEmpty(): boolean {
        if (Array.isArray(this._items)) {
            return !this._items.length;
        }

        return !Object.keys(this._items).length;
    }

    /**
     * Determine if the collection is not empty.
     *
     * @returns {boolean}
     */
    public isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Get and remove the first item from the collection.
     *
     * @returns {*}
     */
    public shift(): unknown {
        if (Array.isArray(this._items)) {
            return this._items.shift();
        }

        const keys = Object.keys(this._items);
        const firstItem = this._items[keys[0]];
        delete this._items[keys[0]];

        return firstItem;
    }

    /**
     * Shuffle the items in the collection.
     *
     * @param {string} seed
     * @returns {Collection}
     */
    public shuffle(seed?: string): Collection {
        return new Collection(shuffle(this._items, seed));
    }

    /**
     * Remove an item from the collection by key.
     *
     * @param {(string|number|Array)} keys
     * @returns {this}
     */
    public forget(keys: string | number | (string | number)[]): this {
        if (Array.isArray(this._items)) {
            const k = wrap(keys);

            for (let i = k.length - 1; i >= 0; i--) {
                this._items.splice(k[i], 1);
            }
        } else {
            for (const key of wrap(keys)) {
                delete this._items[key];
            }
        }

        return this;
    }

    /**
     * Get an item from the collection by key.
     *
     * @param {(number|string)} key
     * @param {*} dflt
     * @returns {*}
     */
    public get(key: number | string, dflt?: unknown): unknown {
        if (this.offsetExists(key)) {
            return this._items[key];
        }

        return value(dflt);
    }

    /**
     * Determine if an item exists at an offset.
     *
     * @param {(number|string)} key
     * @returns {boolean}
     */
    public offsetExists(key: number | string): boolean {
        if (Array.isArray(this._items) && typeof key === 'number') {
            return key >= 0 && key < this._items.length;
        }

        if (isObject(this._items) && typeof key === 'string') {
            return this._items.hasOwnProperty(key);
        }

        return false;
    }

    /**
     * Get an item at a given offset.
     *
     * @param {(number|string)} key
     * @returns {*}
     */
    public offsetGet(key: number | string): unknown {
        return this._items[key];
    }

    /**
     * Reset the keys on the underlying object or array.
     *
     * @returns {Collection}
     */
    public values(): Collection {
        return new Collection(
            Array.isArray(this._items)
                ? [...this._items]
                : (Object as any).values(this._items)
        );
    }

    /**
     * Get an iterator for the items.
     *
     * @returns {Function}
     */
    public getIterator(): IterableIterator<unknown> {
        if (Array.isArray(this._items)) {
            return Collection._getArrayIterator(this._items);
        }

        return Collection._getObjectIterator(this._items);
    }

    /**
     * Count the number of items in the collection.
     *
     * @returns {number}
     */
    public count(): number {
        return Array.isArray(this._items)
            ? this._items.length
            : Object.keys(this._items).length;
    }

    /**
     * Get an operator checker callback.
     *
     * @param {string} key
     * @param {(string|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {Function}
     */
    protected _operatorForWhere(key: string, operator?: unknown, value?: any): Function {
        if (isUndefined(operator) && isUndefined(value)) {
            value = true;

            operator = '=';
        } else if (isUndefined(value)) {
            value = operator;

            operator = '=';
        }

        return (item: unknown): boolean => {
            const retrieved = dataGet(item, key);

            const strings = [retrieved, value].filter((value: any): boolean => (
                isString(value) || (isObject(value) && value.hasOwnProperty('toString'))
            ));

            if (strings.length < 2 && [retrieved, value].filter((value: any): boolean => isObject(value)).length === 1) {
                return ['!=', '<>', '!=='].includes(operator as string);
            }

            switch (operator) {
                default:
                case '=':
                case '==': return retrieved == value; // eslint-disable-line eqeqeq
                case '!=':
                case '<>': return retrieved != value; // eslint-disable-line eqeqeq
                case '<': return retrieved < value;
                case '>': return retrieved > value;
                case '<=': return retrieved <= value;
                case '>=': return retrieved >= value;
                case '===': return retrieved === value;
                case '!==': return retrieved !== value;
            }
        };
    }

    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param {*} items
     * @returns {(Array|Object)}
     */
    protected _getArrayableItems(items: any): unknown[] | object {
        if (Array.isArray(items) || (isObject(items) && items.constructor.name === 'Object')) {
            return items;
        }

        if (items instanceof Collection) {
            return items.all();
        }

        if (isInstance(items) && isArrayable(items)) {
            return items.toArray();
        }

        if (isInstance(items) && isObjectable(items)) {
            return items.toObject();
        }

        if (isInstance(items) && isJsonable(items)) {
            return JSON.parse(items.toJson());
        }

        if (isInstance(items) && isJsonSerializable(items)) {
            return items.jsonSerialize();
        }

        return [items];
    }

}

export default Collection;
