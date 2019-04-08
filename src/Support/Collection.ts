import {
    collapse, crossJoin, except, first, flatten, last, only, pluck, prepend,
    pull, random, shuffle, where, wrap
} from './Arr';
import {isArrayable} from '../Contracts/Arrayable';
import {isObjectable} from '../Contracts/Objectable';
import {isJsonable} from '../Contracts/Jsonable';
import {isJsonSerializable} from '../Contracts/JsonSerializable';
import {
    isObject, isString, isUndefined, isNull, isNullOrUndefined, isInstance,
    findIndex, findKey, inArray, inObject, dataGet, value
} from './helpers';
import {Instantiable} from '../types/container';
import {Item} from '../types/collection';

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
     * @param {Collection} this
     * @param {*} items
     * @returns {Collection}
     */
    public static make<T extends Collection>(this: { new (items: unknown): T },
        items: unknown | unknown[] | object | Collection = []): T {
        return new this(items) as T;
    }

    /**
     * Wrap the given value in a collection if applicable.
     *
     * @param {Collection} this
     * @param {*} value
     * @returns {Collection}
     */
    public static wrap<T extends Collection>(this: { new (value: unknown): T },
        value: unknown): T {
        return (
            value instanceof Collection ? new this(value) : new this(wrap(value))
        ) as T;
    }

    /**
     * Get the underlying items from the given collection if applicable.
     *
     * @param {(Array|Object|Collection|*)} value
     * @returns {(Array|Object)}
     */
    public static unwrap(value: unknown | unknown[] | object | Collection): unknown[] | object {
        return value instanceof Collection ? value.all() : value;
    }

    /**
     * Create a new collection by invoking the callback a given amount of times.
     *
     * @param {Collection} this
     * @param {number} number
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public static times<T extends Collection>(this: {new (array?: unknown[]): T},
        number: number, callback?: Function): T {
        if (number < 1) {
            return new this as T;
        }

        if (isUndefined(callback)) {
            return new this(
                Array.from(
                    Array(number), (x: undefined, i: number): number => i + 1
                )
            ) as T;
        }

        return (
            new this(
                Array.from(
                    Array(number), (x: undefined, i: number): number => i + 1
                )
            )
        ).map(callback) as T;
    }

    /**
     * Get an operator checker callback.
     *
     * @param {(string|Function)} key
     * @param {(string|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {Function}
     */
    protected static _operatorForWhere(key: string, operator?: unknown, value?: any): Function {
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

            if (strings.length < 2
                && [retrieved, value].filter((value: any): boolean => isObject(value)).length === 1) {
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

        return (item: any): any => dataGet(item, value);
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
            const values = this._values();

            const diff = values.filter((value: unknown, index: number): boolean => {
                if (isUndefined(callback)) {
                    return !result.includes(value);
                }

                return !callback(value, index, values, result);
            });

            return new Collection(diff);
        }

        if (Array.isArray(this._items)) {
            const values = Object.values(result);
            const diff = this._items.filter((value: unknown, index: number): boolean => {
                if (isUndefined(callback)) {
                    return !values.includes(value);
                }

                return !callback(value, index, this._items, values);
            });

            return new Collection(diff);
        }

        // If both comparables are objects, keep keys

        const values = Object.values(result);
        const diff = Object.keys(this._items)
            .reduce((acc: object, key: string): object => {
                if (
                    isUndefined(callback) && !values.includes(this._items[key])
                        || (!isUndefined(callback)
                            && !callback(this._items[key], key, this._items, result))
                ) {
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
                ...(Array.isArray(c) ? c : Object.values(c)),
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

        return this.every(Collection._operatorForWhere(key as string, operator, value));
    }

    /**
     * Get all items except for those with the specified keys.
     *
     * @param {...(Collection|Array|string)} keys
     * @returns {Collection}
     */
    public except(...keys: any[]): Collection {
        if (keys.length === 1 && keys[0] instanceof Collection) {
            const k = keys[0].all();
            keys = (Array.isArray(k) ? k : Object.keys(k)) as string[];
        } else if (keys.length === 1 && Array.isArray(keys[0])) {
            keys = keys[0];
        }

        return new Collection(except(this._items, keys));
    }

    /**
     * Determine if an item exists in the collection by key.
     *
     * @param {...(Array|string|number)} keys
     * @returns {boolean}
     */
    public has(...keys: any[]): boolean {
        if (keys.length === 1 && Array.isArray(keys[0])) {
            keys = keys[0];
        }

        for (const key of keys) {
            if (!(Array.isArray(this._items) ? (key >= 0 && key < this._items.length) : this._items.hasOwnProperty(key))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Concatenate values of a given key as a string.
     *
     * @param {string} value
     * @param {(string|undefined)} glue
     * @returns {string}
     */
    public implode(value: string, glue?: string): string {
        const first = this.first();

        if (Array.isArray(first) || (isObject(first) && !isInstance(first))) {
            const items = this.pluck(value).all();

            return this._values(items).join(isUndefined(glue) ? '' : glue);
        }

        return this._values().join(isUndefined(value) ? '' : value);
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
            return new Collection(this._values().filter((value: unknown): boolean => (
                result.includes(value)
            )));
        }

        if (Array.isArray(this._items)) {
            const values = Object.values(result);

            return new Collection(this._items.filter((value: unknown): boolean => (
                values.includes(value)
            )));
        }

        // If both comparables are objects, keep keys

        const values = Object.values(result);
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
            : Object.keys(this._items).filter((key: string): boolean => (
                !!this._items[key]
            ));

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
        return this.filter(Collection._operatorForWhere(key, operator, value));
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
     * Get all of the items in the collection.
     *
     * @returns {(Array|Object)}
     */
    public all(): any {
        return this._items;
    }

    /**
     * Get the average value of a given key.
     *
     * @param {(Function|string|undefined)} callback
     * @returns {(number|undefined)}
     */
    public avg(callback?: Function | string): number | undefined {
        const fn = Collection._valueRetriever(callback);

        const items = this.map((value: unknown): unknown => fn(value))
            .filter((value: unknown): boolean => !isNullOrUndefined(value));

        const count = items.count();

        if (count) {
            return items.sum() / count;
        }
    }

    /**
     * Alias for the "avg" method.
     *
     * @param {(Function|string|undefined)} callback
     * @returns {(number|undefined)}
     */
    public average(callback?: Function | string): number | undefined {
        return this.avg(callback);
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
     * Alias for the "contains" method.
     *
     * @param {*} key
     * @param {(*|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {boolean}
     */
    public some(key: unknown, operator?: unknown, value?: unknown): boolean {
        return this.contains(key, operator, value);
    }

    /**
     * Determine if an item exists in the collection.
     *
     * @param {*} key
     * @param {(*|undefined)} operator
     * @param {(*|undefined)} value
     * @returns {boolean}
     */
    public contains(key: unknown, operator?: unknown, value?: unknown): boolean {
        if (isUndefined(operator) && isUndefined(value)) {
            if (Collection._useAsCallable(key)) {
                const placeholder = {};

                return this.first(key, placeholder) !== placeholder;
            }

            return Array.isArray(this._items)
                ? inArray(key, this._items)
                : inObject(key, this._items);
        }

        return this.contains(
            Collection._operatorForWhere(key as string, operator, value)
        );
    }

    /**
     * Determine if an item exists in the collection using strict comparison.
     *
     * @param {*} key
     * @param {(*|undefined)} value
     * @returns {boolean}
     */
    public containsStrict(key: any, value?: unknown): boolean {
        if (!isUndefined(value)) {
            return this.contains((item: unknown): boolean => (
                dataGet(item, key) === value
            ));
        }

        if (Collection._useAsCallable(key)) {
            return !isUndefined(this.first(key));
        }

        return this._values().includes(key);
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

                return Array.isArray(items) ? items : Object.values(items);
            })
        ));
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
        return this.first(Collection._operatorForWhere(key, operator, value));
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
     * Flip the items in the collection.
     *
     * @returns {Collection}
     */
    public flip(): Collection {
        const result = {};

        /**
         * Add an item to the results.
         *
         * @param {*} item
         * @param {(string|number)} key
         * @returns {void}
         */
        const addItem = (item: any, key: string | number): void => {
            result[item] = key;
        };

        this._loop(addItem);

        return new Collection(result);
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

            return this;
        }

        for (const key of wrap(keys)) {
            delete this._items[key];
        }

        return this;
    }

    /**
     * Get the keys of the collection items.
     *
     * @returns {Collection}
     */
    public keys(): Collection {
        return new Collection(
            Array.isArray(this._items)
                ? Array.from(Array(this._items.length), (x: undefined, i: number): number => i)
                : Object.keys(this._items)
        );
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
     * Get the values of a given key.
     *
     * @param {(string|Array)} value
     * @param {(string|undefined)} key
     * @returns {Collection}
     */
    public pluck(value: string | string[], key?: string): Collection {
        if (Array.isArray(this._items)
            && this._items.every((_: unknown): boolean => isObject(_))) {
            return new Collection(pluck(this._items, value, key));
        }

        return new Collection;
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
     * Run a map over each nested chunk of items.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public mapSpread(callback: Function): Collection {
        return this.map((chunk: unknown[], index: number): unknown => {
            chunk.push(index);

            return callback(...(chunk instanceof Collection ? chunk.all() : chunk));
        });
    }

    /**
     * Run a dictionary map over the items.
     *
     * The callback should return an object with a single key/value pair.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public mapToDictionary(callback: Function): Collection {
        const dictionary = {};

        /**
         * Add the key/value pair obtained from the callback to the object.
         *
         * @param {*} item
         * @param {(string|number)} key
         * @returns {void}
         */
        const addItem = (item: unknown, key: string | number): void => {
            const pair = callback(item, key);

            key = Object.keys(pair)[0];

            const value = pair[key];

            if (!dictionary.hasOwnProperty(key)) {
                dictionary[key] = [];
            }

            dictionary[key].push(value);
        };

        this._loop(addItem);

        return new Collection(dictionary);
    }

    /**
     * Run a grouping map over the items.
     *
     * The callback should return an object with a single key/value pair.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public mapToGroups(callback: Function): Collection {
        const groups = this.mapToDictionary(callback);

        return groups.map((group: object): Collection => Collection.make(group));
    }

    /**
     * Run an object map over each of the items.
     *
     * The callback should return an object with a single key/value pair.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public mapWithKeys(callback: Function): Collection {
        const result = {};

        /**
         * Add the key/value pair obtained from the callback to the object.
         *
         * @param {*} item
         * @param {(string|number)} key
         * @returns {void}
         */
        const addItem = (item: unknown, key: string | number): void => {
            const obj = callback(item, key);

            for (const mapKey of Object.keys(obj)) {
                result[mapKey] = obj[mapKey];
            }
        };

        this._loop(addItem);

        return new Collection(result);
    }

    /**
     * Map a collection and flatten the result by a single level.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    public flatMap(callback: Function): Collection {
        return this.map(callback).collapse();
    }

    /**
     * Map the values into a new class.
     *
     * @param {*} target
     * @returns {Collection}
     */
    public mapInto(target: any): Collection {
        return this.map((value: unknown, key: unknown): unknown => (
            new target(value, key)
        ));
    }

    /**
     * Get the max value of a given key.
     *
     * @param {(Function|string|undefined)} callback
     * @returns {*}
     */
    public max(callback?: Function | string): unknown {
        const fn = Collection._valueRetriever(callback);

        return this.filter((value: unknown): boolean => !isNullOrUndefined(value))
            .reduce((result: boolean, item: unknown): boolean => {
                const value = fn(item);

                return (isNullOrUndefined(result) || value > result) ? value : result;
            });
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

            return new Collection([...Object.values(this._items), ...result]);
        }

        if (Array.isArray(this._items) && !Array.isArray(result)) {
            return new Collection([...this._items, ...Object.values(result)]);
        }

        return new Collection({...this._items, ...result});
    }

    /**
     * Create a collection by using this collection for keys and another for its
     * values.
     *
     * @param {(Array|Object|Collection)} values
     * @returns {Collection}
     */
    public combine(values: unknown[] | object | Collection): Collection {
        const keys = this._values();
        const items = this._values(Collection._getArrayableItems(values));
        const result = {};

        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = items[i];
        }

        return new Collection(result);
    }

    /**
     * Union the collection with the given items.
     *
     * @param {(Object|Collection|undefined)} items
     * @returns {Collection}
     */
    public union(items?: unknown[] | object | Collection): Collection {
        if (Array.isArray(this._items) && Array.isArray(items)) {
            return new Collection([...items, ...this._items]);
        }

        items = Collection._getArrayableItems(items);

        const union = {};

        if (Array.isArray(this._items) && !Array.isArray(items)) {
            // Add the items of the left-hand array
            for (let i = 0; i < this._items.length; i++) {
                union[i] = this._items[i];
            }

            // Add the items of the right-hand object if the key does not exist
            // as an index in the left-hand array
            for (const key of Object.keys(items)) {
                if (!union.hasOwnProperty(key)) union[key] = items[key];
            }
        } else if (!Array.isArray(this._items) && Array.isArray(items)) {
            const lkeys = Object.keys(this._items);

            // Add the items of the left-hand object
            for (const key of lkeys) union[key] = this._items[key];

            // Add the items of the right-hand array if the index does not exist
            // as a key in the left-hand object
            for (let i = 0; i < items.length; i++) {
                if (!lkeys.includes(i.toString())) union[i] = items[i];
            }
        } else {
            const lkeys = Object.keys(this._items);

            // Add the items of the left-hand object
            for (const key of lkeys) union[key] = this._items[key];

            // Add the items of the right-hand object if the key does not exist
            // as a key in the left-hand object
            for (const key of Object.keys(items)) {
                if (!lkeys.includes(key)) union[key] = items[key];
            }
        }

        return new Collection(union);
    }

    /**
     * Get the min value of a given key.
     *
     * @param {(Function|string|undefined)} callback
     * @returns {*}
     */
    public min(callback?: Function | string): unknown {
        const fn = Collection._valueRetriever(callback);

        return this.map((value: unknown): unknown => fn(value))
            .filter((value: unknown): boolean => !isNullOrUndefined(value))
            .reduce((result: boolean, value: any): unknown => (
                (isNullOrUndefined(result) || value < result) ? value : result
            ));
    }

    /**
     * Create a new collection consisting of every n-th element.
     *
     * @param {number} step
     * @param {(number|undefined)} offset
     * @returns {Collection}
     */
    public nth(step: number, offset: number = 0): Collection {
        const result = [];

        let position = 0;

        for (const item of this._values()) {
            if (position % step === offset) {
                result.push(item);
            }

            position++;
        }

        return new Collection(result);
    }

    /**
     * Get the items with the specified keys.
     *
     * @param {...Array} keys
     * @returns {Collection}
     */
    public only(...keys: any): Collection {
        if (!keys.length) {
            return new Collection(this._shallowCopy());
        }

        if (keys.length === 1 && keys[0] instanceof Collection) {
            keys = keys[0].all();
        }

        if (keys.length === 1) {
            keys = keys[0];
        }

        return new Collection(only(this._items, keys));
    }

    /**
     * "Paginate" the collection by slicing it into a smaller collection.
     *
     * @param {number} page
     * @param {number} perPage
     * @returns {Collection}
     */
    public forPage(page: number, perPage: number): Collection {
        const offset = Math.max(0, (page - 1) * perPage);

        return this.slice(offset, perPage);
    }

    /**
     * Transform each item in the collection using a callback.
     *
     * @param {Function} callback
     * @returns {this}
     */
    public transform(callback: Function): this {
        this._items = this.map(callback).all();

        return this;
    }

    /**
     * Return only unique items from the collection array.
     *
     * @param {(string|Function|undefined)} key
     * @param {(boolean)} [strict=false]
     * @returns {Collection}
     */
    public unique(key?: string | Function, strict: boolean = false): Collection {
        const fn = Collection._valueRetriever(key);

        const exists: string[] = [];

        return this.reject((item: unknown, key: string): boolean | undefined => {
            const id = fn(item, key);

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
     * Pass the collection to the given callback and return the result.
     *
     * @param {Function} callback
     * @returns {*}
     */
    public pipe(callback: Function): unknown {
        return callback(this);
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
     * Push an item onto the beginning of the collection.
     *
      * @param {*} value
      * @param {(string|undefined)} key
      * @returns {this}
     */
    public prepend(value: unknown, key?: string): this {
        this._items = prepend(this._items, value, key);

        return this;
    }

    /**
     * Push an item onto the end of the collection.
     *
     * @param {*} value
     * @returns {Collection}
     */
    public push(value: unknown | Item): this {
        if (Array.isArray(this._items)) {
            this._items.push(value);
        } else if (isObject(value)) {
            this._items = {...this._items, ...value};
        }

        return this;
    }

    /**
     * Push all of the given items onto the collection.
     *
     * @param {(Array|Object|Collection)} source
     * @returns {Collection}
     */
    public concat(source: unknown[] | object | Collection): Collection {
        const result = new Collection(this);

        for (const item of this._values(Collection._getArrayableItems(source))) {
            result.push(item);
        }

        return result;
    }

    /**
     * Get and remove an item from the collection.
     *
     * @param {(string|number)} key
     * @param {(*|undefined)} dflt
     * @returns {*}
     */
    public pull(key: string | number, dflt?: unknown): unknown {
        return pull(this._items, key, dflt);
    }

    /**
     * Put an item in the collection by key.
     *
     * @param {?(string|number)} key
     * @param {*} value
     * @returns {this}
     */
    public put(key: string | number | null, value: unknown): this {
        this.offsetSet(key, value);

        return this;
    }

    /**
     * Get one or a specified number of items randomly from the collection.
     *
     * @param {(number|undefined)} number
     * @returns {(Collection|*)}
     */
    public random(number?: number): any {
        if (isUndefined(number)) {
            return random(this._values());
        }

        return new Collection(random(this._values(), number));
    }

    /**
     * Reduce the collection to a single value.
     *
     * @param {Function} callback
     * @param {*} initial
     * @returns {*}
     */
    public reduce(callback: any, initial?: unknown): any {
        return this._values().reduce(callback, initial);
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
     * Reverse items order.
     *
     * @returns {Collection}
     */
    public reverse(): Collection {
        if (Array.isArray(this._items)) {
            return new Collection([...this._items].reverse());
        }

        const result = Object.keys(this._items)
            .reverse()
            .reduce((acc: object, key: string): object => {
                acc[key] = this._items[key];

                return acc;
            }, {});

        return new Collection(result);
    }

    /**
     * Search the collection for a given value and return the corresponding key
     * if successful.
     *
     * @param {(Function|*)} value
     * @param {boolean} [strict=false]
     * @returns {(number|string|boolean)}
     */
    public search(value: Function | unknown, strict: boolean = false): number | string | boolean {
        if (!Collection._useAsCallable(value)) {
            const key = Array.isArray(this._items)
                ? findIndex(value, this._items, strict)
                : findKey(value, this._items, strict);

            return isUndefined(key) || key === -1 ? false : key;
        }

        if (Array.isArray(this._items)) {
            for (let i = 0; i < this._items.length; i++) {
                if (value(this._items[i], i)) return i;
            }
        } else {
            for (const key of Object.keys(this._items)) {
                if (value(this._items[key], key)) return key;
            }
        }

        return false;
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
     * Slice the underlying collection array.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {Collection}
     */
    public slice(offset: number, length?: number): Collection {
        if (!Array.isArray(this._items)) {
            return new Collection;
        }

        /**
         * Compute the end index for "slice()".
         *
         * @param {number} arrLength
         * @returns {(number|undefined)}
         */
        const end = ((arrLength: number): number | undefined => {
            if (!isUndefined(length) && offset < 0 && length >= 0
                && Math.abs(offset) === length) {
                return;
            }

            if (!isUndefined(length) && length < 0) {
                return arrLength + length;
            }

            if (!isUndefined(length) && length >= 0) {
                return offset + length;
            }

            return length;
        })(this._items.length);

        return new Collection([...this._items].slice(offset, end));
    }

    /**
     * Split a collection into a certain number of groups.
     *
     * @param {number} numberOfGroups
     * @returns {Collection}
     */
    public split(numberOfGroups: number): Collection {
        if (this.isEmpty() || !Array.isArray(this._items)) {
            return new Collection;
        }

        const groups = new Collection;

        const groupSize = Math.floor(this.count() / numberOfGroups);

        const remain = this.count() % numberOfGroups;

        let start = 0;

        for (let i = 0; i < numberOfGroups; i++) {
            let size = groupSize;

            if (i < remain) {
                size++;
            }

            if (size) {
                groups.push(
                    new Collection([...this._items].slice(start, start + size))
                );

                start += size;
            }
        }

        return groups;
    }

    /**
     * Chunk the underlying collection array.
     *
     * @param {number} size
     * @returns {Collection}
     */
    public chunk(size: number): Collection {
        if (size <= 0) return new Collection;

        const chunks = this._values()
            .reduce((acc: Collection[], item: unknown, index: number): unknown[] => {
                const chunkIndex = Math.floor(index / size);

                if (!acc[chunkIndex]) {
                    acc[chunkIndex] = new Collection; // Start a new chunk
                }

                acc[chunkIndex].push(item);

                return acc;
            }, []);

        return new Collection(chunks);
    }

    /**
     * Sort through each item with a callback.
     *
     * @param {(Function|undefined)} callback
     * @returns {Collection}
     */
    public sort(callback?: (a: any, b: any) => number): Collection {
        const items = this._values();

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
     * Sort the collection using the given callback.
     *
     * @param {(Function|string)} callback
     * @param {boolean} [descending=false]
     * @returns {Collection}
     */
    public sortBy(callback: Function | string, descending: boolean = false): Collection {
        const results: Item[] = [];

        const fn = Collection._valueRetriever(callback);

        /**
         * Add an item to the results.
         *
         * @param {*} item
         * @param {(string|number)} key
         * @returns {void}
         */
        const addItem = (item: unknown, key: string | number): void => {
            results.push({key, value: fn(item, key)});
        };

        // First we will loop through the items and get the comparator from a
        // callback function which we were given. Then, we will sort the
        // returned values and grab the corresponding values for the sorted keys
        // from this array.
        this._loop(addItem);

        // eslint-disable-next-line require-jsdoc
        const c = (a: Item, b: Item): number => {
            if (a.value < b.value) return -1;
            if (a.value > b.value) return 1;

            return 0;
        };
        descending ? results.sort(c).reverse() : results.sort(c);

        // Once we have sorted all of the keys in the array, we will loop
        // through them and grab the corresponding model so we can set the
        // underlying items list to the sorted version. Then we'll just return
        // the collection instance.
        for (const item of results) {
            item.value = this._items[item.key];
        }

        const ordered = Array.isArray(this._items)
            ? results.reduce((acc: unknown[], item: Item): unknown[] => {
                acc.push(item.value);

                return acc;
            }, [])
            : results.reduce((acc: object, item: Item): object => {
                acc[item.key] = item.value;

                return acc;
            }, {});

        return new Collection(ordered);
    }

    /**
     * Sort the collection in descending order using the given callback.
     *
     * @param {(Function|string)} callback
     * @returns {Collection}
     */
    public sortByDesc(callback: Function | string): Collection {
        return this.sortBy(callback, true);
    }

    /**
     * Sort the collection keys.
     *
     * @param {boolean} [descending=false]
     * @returns {Collection}
     */
    public sortKeys(descending: boolean = false): Collection {
        if (Array.isArray(this._items)) {
            return new Collection([...this._items]);
        }

        const keys = Object.keys(this._items);
        descending ? keys.sort().reverse() : keys.sort();

        return new Collection(keys.reduce((acc: object, key: string): object => {
            acc[key] = this._items[key];

            return acc;
        }, {}));
    }

    /**
     * Sort the collection keys in descending order.
     *
     * @returns {Collection}
     */
    public sortKeysDesc(): Collection {
        return this.sortKeys(true);
    }

    /**
     * Splice a portion of the underlying collection array.
     *
     * @param {number} offset
     * @param {(number|undefined)} length
     * @param {*} replacement
     * @returns {Collection}
     */
    public splice(offset: number, length?: number, replacement: unknown[] | unknown = []): Collection {
        if (!Array.isArray(this._items)) {
            return new Collection;
        }

        if (isUndefined(length)) {
            return new Collection(this._items.splice(offset));
        }

        return new Collection(this._items.splice(offset, length, ...wrap(replacement)));
    }

    /**
     * Get the sum of the given values.
     *
     * @param {(Function|string|undefined)} callback
     * @returns {number}
     */
    public sum(callback?: Function | string): number {
        if (isUndefined(callback)) {
            const items = this._values()
                .reduce((acc: number, item: number): number => {
                    acc += item;

                    return acc;
                }, 0);
        }

        const fn = Collection._valueRetriever(callback);

        return this.reduce((result: number, item: any): number => (
            result + fn(item)
        ), 0);
    }

    /**
     * Take the first or last "limit" items.
     *
     * @param {number} limit
     * @returns {Collection}
     */
    public take(limit: number): Collection {
        if (limit < 0) {
            return this.slice(limit, Math.abs(limit));
        }

        return this.slice(0, limit);
    }

    /**
     * Get an item from the collection by key.
     *
     * @param {(number|string)} key
     * @param {*} dflt
     * @returns {*}
     */
    public get(key: number | string, dflt?: unknown): any {
        if (this.offsetExists(key)) {
            return this._items[key];
        }

        return value(dflt);
    }

    /**
     * Group an object by a field or using a callback.
     *
     * @param {(Array|Function|string)} groupBy
     * @param {bool} preserveKeys
     * @returns {Collection}
     */
    public groupBy(groupBy: [string, Function] | [Function] | Function | string,
        preserveKeys: boolean = false): Collection {
        let nextGroups: [string, Function] | [Function] | null = null;

        if (Array.isArray(groupBy)) {
            nextGroups = groupBy;

            groupBy = nextGroups.shift() as string | Function;
        }

        groupBy = Collection._valueRetriever(groupBy);

        const results = {};

        /**
         * Add a group to the results.
         *
         * @param {*} value
         * @param {(key|number)} key
         * @returns {void}
         */
        const addResult = (value: unknown, key: string | number): void => {
            let groupKeys = (groupBy as Function)(value, key);

            if (!Array.isArray(groupKeys)) {
                groupKeys = [groupKeys];
            }

            for (let groupKey of groupKeys) {
                groupKey = typeof groupKey === 'boolean' ? (groupKey === true ? 1 : 0) : groupKey;

                if (!results.hasOwnProperty(groupKey)) {
                    results[groupKey] = new Collection(preserveKeys ? {} : []);
                }

                results[groupKey].offsetSet(preserveKeys ? key : null, value);
            }
        };

        this._loop(addResult);

        const result = new Collection(results);

        if (!isNull(nextGroups) && nextGroups.length) {
            return result.map((group: Collection): Collection => (
                group.groupBy(
                    [...(nextGroups as [Function])] as [Function], preserveKeys
                )
            ));
        }

        return result;
    }

    /**
     * Key an object by a field or using a callback.
     *
     * @param {(Function|string)} keyBy
     * @returns {Collection}
     */
    public keyBy(keyBy: Function | string): Collection {
        const fn = Collection._valueRetriever(keyBy);

        const results = {};

        /**
         * Add an item to the results.
         *
         * @param {*} item
         * @param {(string|number)} key
         * @returns {void}
         */
        const addItem = (item: unknown, key: string | number): void => {
            const resolvedKey = fn(item, key);

            results[resolvedKey] = item;
        };

        this._loop(addItem);

        return new Collection(results);
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
     * Set the item at a given offset.
     *
     * @param {?(string|number)} key
     * @param {*} value
     * @returns {void}
     */
    public offsetSet(key: string | number | null, value: unknown): void {
        if (isNull(key) && Array.isArray(this._items)) {
            this._items.push(value);
        } else if (typeof key === 'number' && Array.isArray(this._items)) {
            this._items.splice(key, 0, value);
        } else if (!isNull(key) && !Array.isArray(this._items)) {
            this._items[key] = value;
        }
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
                : Object.values(this._items)
        );
    }

    /**
     * Zip the collection together with one or more arrays.
     *
     * e.g. (new Collection([1, 2, 3])).zip([4, 5, 6]);
     *      => [[1, 4], [2, 5], [3, 6]]
     *
     * @param {...Array} items
     * @returns {Collection}
     */
    public zip(...items: any[]): Collection {
        const arrayableItems = items.map((items: unknown[]): unknown[] => (
            this._values(Collection._getArrayableItems(items))
        ));

        return new Collection(
            this._values().map((_: unknown, i: number): Collection => (
                new Collection([
                    _,
                    ...arrayableItems.map((_: unknown, j: number): unknown => (
                        arrayableItems[j][i]
                    ))
                ])
            ))
        );
    }

    /**
     * Pad collection to the specified length with a value.
     *
     * @param {number} size
     * @param {*} value
     * @returns {Collection}
     */
    public pad(size: number, value: unknown): Collection {
        if (!Array.isArray(this._items)) {
            // If the underlying items are elements of an object just return a
            // shallow copy
            return new Collection({...this._items});
        }

        const s = Math.abs(size) - this._items.length;

        if (s < 0) {
            return new Collection([...this._items]);
        }

        const items = Array.from(Array(s), (): unknown => value);

        return new Collection(
            size >= 0 ? [...this._items, ...items] : [...items, ...this._items]
        );
    }

    /**
     * Get the collection of items as a plain (combination of) array/object.
     *
     * @returns {(Array|Object)}
     */
    public toPrimitive(): unknown[] | object {
        if (Array.isArray(this._items)) {
            return this._items.map((value: any): unknown => {
                if (value instanceof Collection) return value.toPrimitive();

                if (isInstance(value) && isArrayable(value)) {
                    return value.toArray();
                }

                if (isInstance(value) && isObjectable(value)) {
                    return value.toObject();
                }

                return value;
            });
        }

        return Object.keys(this._items).reduce((acc: object, key: string): object => {
            if (this._items[key] instanceof Collection) {
                acc[key] = this._items[key].toPrimitive();
            } else if (isInstance(this._items[key]) && isArrayable(this._items[key])) {
                acc[key] = this._items[key].toArray();
            } else if (isInstance(this._items[key]) && isObjectable(this._items[key])) {
                acc[key] = this._items[key].toObject();
            } else {
                acc[key] = this._items[key];
            }

            return acc;
        }, {});
    }

    /**
     * Convert the object into something JSON serializable.
     *
     * @returns {Array}
     */
    public jsonSerialize(): unknown[] {
        return this._values().map((value: any): any => {
            if (isJsonSerializable(value)) {
                return value.jsonSerialize();
            }

            if (isJsonable(value)) {
                return JSON.parse(value.toJson());
            }

            if (isArrayable(value)) {
                return value.toArray();
            }

            if (isObjectable(value)) {
                return value.toObject();
            }

            return value;
        });
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
        return this._values().length;
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

    /**
     * Loop over the collection items, passing them to the given function.
     *
     * @param {Function} fn1
     * @param {(Function|undefined)} fn2
     * @returns {void}
     */
    private _loop(fn1: Function, fn2?: Function): void {
        if (Array.isArray(this._items)) {
            for (let i = 0; i < this._items.length; i++) {
                fn1(this._items[i], i);
            }
        } else {
            for (const key of Object.keys(this._items)) {
                isUndefined(fn2)
                    ? fn1(this._items[key], key)
                    : fn2(this._items[key], key);
            }
        }
    }

    /**
     * Get the values of the collection.
     *
     * @param {(Array|Object|undefined)} items
     * @returns {Array}
     */
    private _values(items?: unknown[] | object): any[] {
        items = isUndefined(items) ? this._items : items;

        return Array.isArray(items) ? items : Object.values(items);
    }

}

export default Collection;
