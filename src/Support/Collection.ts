import {
    collapse, crossJoin, first, flatten, last, shuffle, where, wrap
} from './Arr';
import {isArrayable} from '../Contracts/IArrayable';
import {isObjectable} from '../Contracts/IObjectable';
import {isJsonable} from '../Contracts/IJsonable';
import {isJsonSerializable} from '../Contracts/IJsonSerializable';
import {
    isObject, isString, isUndefined, isInstance, inArray, dataGet, value
} from './helpers';
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
     * @constructor
     * @param {*} items
     */
    public constructor(items: unknown = []) {
        this._items = Collection._getArrayableItems(items);
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
     * Determine if the given value is callable, but not a string.
     *
     * @param {*} value
     * @returns {boolean}
     */
    protected static _useAsCallable(value: unknown): value is Function {
        return !isString(value) && value instanceof Function;
    }

    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param {*} items
     * @returns {(Array|Object)}
     */
    protected static _getArrayableItems(items?: any): unknown[] | object {
        if (isUndefined(items)) return [];

        if (Array.isArray(items)
            || (isObject(items) && items.constructor.name === 'Object')) {
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

    /**
     * Get a value retrieving callback.
     *
     * @param {(string|Function|undefined)} value
     * @returns {Function}
     */
    protected static _valueRetriever(value?: string | Function): Function {
        if (Collection._useAsCallable(value)) {
            return value;
        }

        return (item: unknown): unknown => dataGet(item, value);
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
     * Determine if an array includes the given item.
     *
     * @param {Array} values
     * @param {*} item
     * @param {boolean} [strict=false]
     * @returns {boolean}
     */
    private static _includes(values: unknown[], item: unknown, strict: boolean = false): boolean {
        return strict
            ? values.includes(item)
            : !isUndefined(values.find((_: unknown): boolean => item == _)); // eslint-disable-line eqeqeq
    }

    /**
     * Get the items in the collection that are not present in the given items.
     *
     * @param {(Array|Object|Collection|undefined)} items
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public diff(items?: unknown[] | object | Collection, callback?: Function): Collection {
        if (isUndefined(items)) {
            return this._shallowCopy();
        }

        const result = Collection._getArrayableItems(items);

        // If any of the comparables is an array, lose the keys of the other

        if (Array.isArray(result)) {
            const values = Array.isArray(this._items)
                ? this._items
                : (Object as any).values(this._items);
            const diff = values.filter((value: unknown, index: number): boolean => {
                if (isUndefined(callback)) {
                    return !result.includes(value);
                }

                return !callback(value, index, values, result);
            });

            return new Collection(diff);
        }

        if (Array.isArray(this._items)) {
            const values = (Object as any).values(result);
            const diff = this._items.filter((value: unknown, index: number): boolean => {
                if (isUndefined(callback)) {
                    return !values.includes(value);
                }

                return !callback(value, index, this._items, values);
            });

            return new Collection(diff);
        }

        // If both comparables are objects, keep keys

        const values = (Object as any).values(result);
        const diff = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (isUndefined(callback) && !values.includes(this._items[key])
                    || (!isUndefined(callback) && !callback(this._items[key], key, this._items, result))) {
                    acc[key] = this._items[key];
                }

                return acc;
            }, {});

        return new Collection(diff);
    }

    /**
     * Get the items in the collection whose keys are not present in the given
     * items.
     *
     * @param {(Object|Collection|undefined)} items
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public diffKeys(items?: object | Collection, callback?: Function): Collection {
        if (isUndefined(items)) {
            return this._shallowCopy();
        }

        const result = Collection._getArrayableItems(items);
        const diff = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (isUndefined(callback) && !result.hasOwnProperty(key)
                    || (!isUndefined(callback) && !callback(this._items[key], key, this._items, result))) {
                    acc[key] = this._items[key];
                }

                return acc;
            }, {});

        return new Collection(diff);
    }

    /**
     * Get the items in the collection whose keys and values are not present in
     * the given items.
     *
     * @param {(Object|Collection|undefined)} items
     * @returns {Collection}
     */
    public diffAssoc(items?: object | Collection): Collection {
        if (isUndefined(items)) {
            return this._shallowCopy();
        }

        const result = Collection._getArrayableItems(items);
        const diff = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (!result.hasOwnProperty(key) || result[key] !== this._items[key]) {
                    acc[key] = this._items[key];
                }

                return acc;
            }, {});

        return new Collection(diff);
    }

    /**
     * Execute a callback over eacht item.
     *
     * @param {Function} callback
     * @returns {this}
     */
    public each(callback: Function): this {
        if (Array.isArray(this._items)) {
            for (let i = 0; i < this._items.length; i++) {
                if (callback(this._items[i], i) === false) break;
            }
        } else {
            for (const key of Object.keys(this._items)) {
                if (callback(this._items[key], key) === false) break;
            }
        }

        return this;
    }

    /**
     * Execute a callback over each nested chunk of items.
     *
     * @param {Function} callback
     * @returns {this}
     */
    public eachSpread(callback: Function): this {
        return this.each((chunk: unknown[] | Collection, key: string): boolean | undefined => {
            let c: any = Collection.unwrap(chunk);
            c = [
                ...(Array.isArray(c) ? c : (Object as any).values(c)),
                key
            ];

            return callback(...c);
        });
    }

    /**
     * Determine if all the items in the collection pass the given test.
     *
     * @param {(string|Function)} key
     * @param {(string|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {boolean}
     */
    public every(key: string | Function, operator?: unknown, value?: unknown): boolean {
        if (isUndefined(operator) && isUndefined(value)) {
            const callback = Collection._valueRetriever(key);

            if (Array.isArray(this._items)) {
                for (let i = 0; i < this._items.length; i++) {
                    if (!callback(this._items[i], i)) return false;
                }
            } else {
                for (const key of Object.keys(this._items)) {
                    if (!callback(this._items[key], key)) return false;
                }
            }

            return true;
        }

        return this.every(this._operatorForWhere(key as string, operator, value));
    }

    /**
     * Intersect the collection with the given items.
     *
     * @param {(Array|Object|Collection|undefined)} items
     * @returns {Collection}
     */
    public intersect(items?: unknown[] | object | Collection): Collection {
        if (isUndefined(items)) {
            return new Collection([]);
        }

        const result = Collection._getArrayableItems(items);

        // If any of the comparables is an array, lose the keys of the other

        if (Array.isArray(result)) {
            const values = Array.isArray(this._items)
                ? this._items
                : (Object as any).values(this._items);

            return new Collection(values.filter((value: unknown): boolean => (
                result.includes(value)
            )));
        }

        if (Array.isArray(this._items)) {
            const values = (Object as any).values(result);

            return new Collection(this._items.filter((value: unknown): boolean => (
                values.includes(value)
            )));
        }

        // If both comparables are objects, keep keys

        const values = (Object as any).values(result);
        const intersect = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (values.includes(this._items[key])) {
                    acc[key] = this._items[key];
                }

                return acc;
            }, {});

        return new Collection(intersect);
    }

    /**
     * Intersect the collection with the given items by key.
     *
     * @param {(Object|Collection|undefined)} items
     * @returns {Collection}
     */
    public intersectByKeys(items?: object | Collection): Collection {
        if (isUndefined(items) || Array.isArray(this._items)) {
            return new Collection([]);
        }

        const result = Collection._getArrayableItems(items);
        const intersect = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (result.hasOwnProperty(key)) {
                    acc[key] = this._items[key];
                }

                return acc;
            }, {});

        return new Collection(intersect);
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
        const items = Collection._getArrayableItems(values) as unknown[];

        return this.filter((item: unknown): boolean => (
            Collection._includes(items, dataGet(item, key), strict)
        ));
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
     * Filter items where the given key between values.
     *
     * @param {string} key
     * @param {Array} values
     * @returns {Collection}
     */
    public whereBetween(key: string, values: unknown[]): Collection {
        return this.where(key, '>=', first(values))
            .where(key, '<=', last(values));
    }

    /**
     * Filter items by the given key value pair.
     *
     * @param {string} key
     * @param {Array} values
     * @param {boolean} strict
     * @returns {Collection}
     */
    public whereNotIn(key: string, values: unknown[], strict: boolean = false): Collection {
        const items = Collection._getArrayableItems(values) as unknown[];

        return this.reject((item: unknown): boolean => (
            Collection._includes(items, dataGet(item, key), strict)
        ));
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     *
     * @param {string} key
     * @param {Array} values
     * @returns {Collection}
     */
    public whereNotInStrict(key: string, values: unknown[]): Collection {
        return this.whereNotIn(key, values, true);
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
     * Create a collection of all elements that do not pass a given truth test.
     *
     * @param {(*|Function)} callback
     * @returns {Collection}
     */
    public reject(callback: unknown | Function): Collection {
        if (Collection._useAsCallable(callback)) {
            return this.filter((value: unknown, key: string): boolean => (
                !callback(value, key)
            ));
        }

        // eslint-disable-next-line eqeqeq
        return this.filter((item: unknown): boolean => item != callback);
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
     * Collapse the collection of items into a single array / object.
     *
     * @returns {Collection}
     */
    public collapse(): Collection {
        return new Collection(collapse(this._items));
    }

    /**
     * Cross join with the given lists, returning all possible permutations.
     *
     * @param {...(Array|Collection)} lists
     * @returns {Collection}
     */
    public crossJoin(...lists: unknown[]): Collection {
        return new Collection(crossJoin(
            this._items, ...lists.map((_: unknown): unknown[] => {
                const items = Collection._getArrayableItems(_);

                return Array.isArray(items) ? items : (Object as any).values(items);
            })
        ));
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
     * Get a flattened array or object of the items in the collection.
     *
     * @param {number} depth
     * @returns {Collection}
     */
    public flatten(depth: number = Infinity): Collection {
        return new Collection(flatten(this._items, depth));
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
     * Merge the collection with the given items.
     *
     * @param {(Array|Object|Collection)} items
     * @returns {Collection}
     */
    public merge(items?: unknown[] | object | Collection): Collection {
        if (isUndefined(items)) {
            return new Collection(
                Array.isArray(this._items) ? [...this._items] : {...this._items}
            );
        }

        const result = Collection._getArrayableItems(items);

        if (Array.isArray(this._items) && Array.isArray(result)) {
            return new Collection([...this._items, ...result]);
        }

        // If only one of the mergeables is an array, keys are lost

        if (!Array.isArray(this._items) && Array.isArray(result)) {

            return new Collection([
                ...(Object as any).values(this._items), ...result
            ]);
        }

        if (Array.isArray(this._items) && !Array.isArray(result)) {
            return new Collection([
                ...this._items, ...(Object as any).values(result)
            ]);
        }

        return new Collection({...this._items, ...result});
    }

    /**
     * Union the collection with the given items.
     *
     * @param {(Object|Collection|undefined)} items
     * @returns {Collection}
     */
    public union(items?: object | Collection): Collection {
        if (Array.isArray(this._items)) {
            // If the collection does not have any keys, simply return a shallow
            // copy
            return this._shallowCopy();
        }

        const result = Collection._getArrayableItems(items);
        const lkeys = Object.keys(this._items);
        const union = {};

        for (const key of lkeys) union[key] = this._items[key];
        for (const key of Object.keys(result)) {
            if (!lkeys.includes(key)) {
                union[key] = result[key];
            }
        }

        return new Collection(union);
    }

    /**
     * Return only unique items from the collection array.
     *
     * @param {(string|Function|undefined)} key
     * @param {(boolean)} [strict=false]
     * @returns {Collection}
     */
    public unique(key?: string | Function, strict: boolean = false): Collection {
        const callback = Collection._valueRetriever(key);

        const exists: string[] = [];

        return this.reject((item: unknown, key: string): boolean | undefined => {
            const id = callback(item, key);

            if (inArray(id, exists, strict)) {
                return true;
            }

            exists.push(id);
        });
    }

    /**
     * Return only unique items from the collection array using strict
     * comparison.
     *
     * @param {(string|Function|undefined)} key
     * @returns {Collection}
     */
    public uniqueStrict(key?: string | Function): Collection {
        return this.unique(key, true);
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
     * Push an item onto the end of the collection.
     *
     * @param {*} value
     * @returns {Collection}
     */
    public push(value: unknown | {key: string, value: unknown}): this {
        if (Array.isArray(this._items)) {
            this._items.push(value);
        } else if (isObject(value)) {
            this._items = {...this._items, ...value};
        }

        return this;
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
     * Sort through each item with a callback.
     *
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public sort(callback?: Function): Collection {
        const items = Array.isArray(this._items)
            ? this._items
            : (Object as any).values(this._items);

        if (isUndefined(callback)) {
            items.every((item: unknown): boolean => typeof item === 'number')
                ? items.sort((a: number, b: number): number => a - b)
                : items.sort();
        } else {
            items.sort(callback);
        }

        return new Collection(items);
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
     * @param {(string|Function)} key
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
     * Return a shallow copy of the collection.
     *
     * @returns {Collection}
     */
    private _shallowCopy(): Collection {
        return new Collection(
            Array.isArray(this._items) ? [...this._items] : {...this._items}
        );
    }

}

export default Collection;
