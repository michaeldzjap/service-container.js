import Collection from '@src/Support/Collection';
import IArrayable from '@src/Contracts/IArrayable';
import IJsonable from '@src/Contracts/IJsonable';
import IJsonSerializable from '@src/Contracts/IJsonSerializable';
import IObjectable from '@src/Contracts/IObjectable';
import {isString} from '@src/Support/helpers';

// eslint-disable-next-line max-statements
describe('Collection', (): void => {
    test('first returns first item in collection', (): void => {
        const c = new Collection(['foo', 'bar']);
        expect(c.first()).toBe('foo');
    });

    test('first with callback', (): void => {
        const data = new Collection(['foo', 'bar', 'baz']);
        const result = data.first((value: string): boolean => value === 'bar');
        expect(result).toBe('bar');
    });

    test('first with callback and default', (): void => {
        const data = new Collection(['foo', 'bar']);
        const result = data.first(
            (value: string): boolean => value === 'baz', 'default'
        );
        expect(result).toBe('default');
    });

    test('first with default and without callback', (): void => {
        const data = new Collection;
        const result = data.first(null, 'default');
        expect(result).toBe('default');
    });

    test('first where', (): void => {
        type Item = {material: string, type: string};

        const data = new Collection([
            {material: 'paper', type: 'book'},
            {material: 'rubber', type: 'gasket'},
        ] as Item[]);

        expect((data.firstWhere('material', 'paper') as Item).type).toBe('book');
        expect((data.firstWhere('material', 'rubber') as Item).type).toBe('gasket');
        expect(data.firstWhere('material', 'nonexistant')).toBeUndefined();
        expect(data.firstWhere('nonexistant', 'key')).toBeUndefined();
    });

    test('last returns last item in collection', (): void => {
        const c = new Collection(['foo', 'bar']);
        expect(c.last()).toBe('bar');
    });

    test('last with callback', (): void => {
        const data = new Collection([100, 200, 300]);
        let result = data.last((value: number): boolean => value < 250);
        expect(result).toBe(200);
        result = data.last((value: number, key: number): boolean => key > 0);
        expect(result).toBe(200);
    });

    test('last with callback and default', (): void => {
        const data = new Collection(['foo', 'bar']);
        const result = data.last(
            (value: string): boolean => value === 'baz', 'default'
        );
        expect(result).toBe('default');
    });

    test('last with default and without callback', (): void => {
        const data = new Collection;
        const result = data.last(null, 'default');
        expect(result).toBe('default');
    });

    test('pop returns and removes last item in collection', (): void => {
        const c = new Collection(['foo', 'bar']);

        expect(c.pop()).toBe('bar');
        expect(c.first()).toBe('foo');
    });

    test('shift returns and removes first item in collection', (): void => {
        const c = new Collection(['foo', 'bar']);

        expect(c.shift()).toBe('foo');
        expect(c.first()).toBe('bar');
    });

    test('empty collection is empty', (): void => {
        const c = new Collection;

        expect(c.isEmpty()).toBeTruthy();
    });

    test('empty collection is not empty', (): void => {
        const c = new Collection(['foo', 'bar']);

        expect(c.isEmpty()).toBeFalsy();
        expect(c.isNotEmpty()).toBeTruthy();
    });

    test('collection is constructed', (): void => {
        let collection = new Collection('foo');
        expect(collection.all()).toEqual(['foo']);

        collection = new Collection(2);
        expect(collection.all()).toEqual([2]);

        collection = new Collection(false);
        expect(collection.all()).toEqual([false]);

        collection = new Collection(undefined); // eslint-disable-line no-undefined
        expect(collection.all()).toHaveLength(0);

        collection = new Collection;
        expect(collection.all()).toHaveLength(0);
    });

    test('collection shuffle with seed', (): void => {
        const collection = new Collection([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

        const firstRandom = collection.shuffle('1234');
        const secondRandom = collection.shuffle('1234');

        expect(firstRandom).toEqual(secondRandom);
    });

    test('get arrayable items', (): void => {
        const method = Reflect.getOwnPropertyDescriptor(
            Collection, '_getArrayableItems'
        ) as PropertyDescriptor;

        let items: any = new TestArrayableObject;
        const array = method.value(items);
        expect(array).toEqual([1, 2, 3]);

        items = new TestObjectableObject;
        let obj = method.value(items);
        expect(obj).toEqual({foo: 'bar'});

        items = new TestJsonableObject;
        obj = method.value(items);
        expect(obj).toEqual({foo: 'bar'});

        items = new TestJsonSerializeObject;
        obj = method.value(items);
        expect(obj).toEqual({foo: 'bar'});

        items = new Collection({foo: 'bar'});
        obj = method.value(items);
        expect(obj).toEqual({foo: 'bar'});

        items = {foo: 'bar'};
        obj = method.value(items);
        expect(obj).toEqual({foo: 'bar'});
    });

    test('forget single key', (): void => {
        let c = new Collection(['foo', 'bar']);
        c.forget(0);
        expect(c.all()).toEqual(['bar']);

        c = new Collection({foo: 'bar', baz: 'qux'});
        c.forget('foo');
        expect(c.all()).toEqual({baz: 'qux'});
    });

    test('forget array of keys', (): void => {
        let c = new Collection(['foo', 'bar', 'baz']);
        c.forget([0, 2]);
        expect(c.all()).toEqual(['bar']);

        c = new Collection({name: 'Riley Martin', foo: 'bar', baz: 'qux'});
        c.forget(['foo', 'baz']);
        expect(c.all()).toEqual({name: 'Riley Martin'});
    });

    test('countable', (): void => {
        const c = new Collection(['foo', 'bar']);
        expect(c.count()).toBe(2);
    });

    test('iterable', (): void => {
        let c = new Collection(['foo']);
        expect(c.getIterator()).toBeInstanceOf(Object);

        let generator = c.getIterator();
        expect(generator.next().value).toBe('foo');
        expect(generator.next().value).toBeUndefined();

        c = new Collection({foo: 'bar'});
        expect(c.getIterator()).toBeInstanceOf(Object);

        generator = c.getIterator();
        expect(generator.next().value).toBe('bar');
        expect(generator.next().value).toBeUndefined();
    });

    test('filter', (): void => {
        let c = new Collection([{id: 1, name: 'Hey'}, {id: 2, name: 'Now'}]);
        expect(
            c.filter((item: {id: number, name: string}): boolean => item.id === 2).all()
        ).toEqual([{id: 2, name: 'Now'}]);

        c = new Collection(['', 'Hey', '', 'Now']);
        expect(c.filter().values().all()).toEqual(['Hey', 'Now']);

        c = new Collection({id: 1, first: 'Hey', second: 'Now'});
        expect(
            c.filter((item: unknown, key: string): boolean => key !== 'id').all()
        ).toEqual({first: 'Hey', second: 'Now'});
    });

    // eslint-disable-next-line max-statements
    test('where', (): void => {
        let c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);

        expect(c.where('v', 3).values().all()).toEqual([{v: 3}, {v: '3'}]);
        expect(c.where('v', '=', 3).values().all()).toEqual([{v: 3}, {v: '3'}]);
        expect(c.where('v', '==', 3).values().all()).toEqual([{v: 3}, {v: '3'}]);
        expect(c.where('v', 'garbage', 3).values().all()).toEqual([{v: 3}, {v: '3'}]);
        expect(c.where('v', '===', 3).values().all()).toEqual([{v: 3}]);

        expect(c.where('v', '<>', 3).values().all()).toEqual([{v: 1}, {v: 2}, {v: 4}]);
        expect(c.where('v', '!=', 3).values().all()).toEqual([{v: 1}, {v: 2}, {v: 4}]);
        expect(c.where('v', '!==', 3).values().all()).toEqual([{v: 1}, {v: 2}, {v: '3'}, {v: 4}]);
        expect(c.where('v', '<=', 3).values().all()).toEqual([{v: 1}, {v: 2}, {v: 3}, {v: '3'}]);
        expect(c.where('v', '>=', 3).values().all()).toEqual([{v: 3}, {v: '3'}, {v: 4}]);
        expect(c.where('v', '<', 3).values().all()).toEqual([{v: 1}, {v: 2}]);
        expect(c.where('v', '>', 3).values().all()).toEqual([{v: 4}]);

        const obj = {foo: 'bar'};

        expect(c.where('v', obj).values().all()).toEqual([]);

        expect(c.where('v', '<>', obj).values().all()).toEqual([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);

        expect(c.where('v', '!=', obj).values().all()).toEqual([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);

        expect(c.where('v', '!==', obj).values().all()).toEqual([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);

        expect(c.where('v', '>', obj).values().all()).toEqual([]);

        c = new Collection([{v: 1}, {v: obj}]);
        expect(c.where('v', obj).values().all()).toEqual([{v: obj}]);

        expect(c.where('v', '<>', null).values().all()).toEqual([{v: 1}, {v: obj}]);

        expect(c.where('v', '<', null).values().all()).toEqual([]);

        // Different, because 2 == true --> "true" in PHP, but "false" in JS
        c = new Collection([{v: 1}, {v: 1}, {v: undefined}]); // eslint-disable-line no-undefined
        expect(c.where('v').values().all()).toEqual([{v: 1}, {v: 1}]);
    });

    test('where strict', (): void => {
        const c = new Collection([{v: 3}, {v: '3'}]);

        expect(c.whereStrict('v', 3).values().all()).toEqual([{v: 3}]);
    });

    test('where instance of', (): void => {
        const c = new Collection([new Collection, new Collection, {}, new Collection]);
        expect(c.whereInstanceOf(Collection).count()).toBe(3);
    });

    test('where in', (): void => {
        const c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);
        expect(c.whereIn('v', [1, 3]).values().all()).toEqual([{v: 1}, {v: 3}, {v: '3'}]);
    });

    test('where in strict', (): void => {
        const c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);
        expect(c.whereInStrict('v', [1, 3]).values().all()).toEqual([{v: 1}, {v: 3}]);
    });

    test('where not in', (): void => {
        const c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);
        expect(c.whereNotIn('v', [1, 3]).values().all()).toEqual([{v: 2}, {v: 4}]);
    });

    test('where not in strict', (): void => {
        const c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);
        expect(c.whereNotInStrict('v', [1, 3]).values().all()).toEqual([{v: 2}, {v: '3'}, {v: 4}]);
    });

    test('values', (): void => {
        const c = new Collection([{id: 1, name: 'Hey'}, {id: 2, name: 'Now'}]);
        expect(
            c.filter((item: {id: number, name: string}): boolean => item.id === 2).values().all()
        ).toEqual([{id: 2, name: 'Now'}]);
    });

    test('between', (): void => {
        const c = new Collection([{v: 1}, {v: 2}, {v: 3}, {v: '3'}, {v: 4}]);

        expect(c.whereBetween('v', [2, 4]).values().all()).toEqual([{v: 2}, {v: 3}, {v: '3'}, {v: 4}]);
        expect(c.whereBetween('v', [-1, 1]).values().all()).toEqual([{v: 1}]);
        expect(c.whereBetween('v', [3, 3]).values().all()).toEqual([{v: 3}, {v: '3'}]);
    });

    test('flatten', (): void => {
        // Flat arrays are unaffected
        let c = new Collection(['#foo', '#bar', '#baz']);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Nested arrays are flattened with existing flat items
        c = new Collection([['#foo', '#bar'], '#baz']);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Sets of nested arrays are flattened
        c = new Collection([['#foo', '#bar'], ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Deeply nested arrays are flattened
        c = new Collection([['#foo', ['#bar']], ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Nested collections are flattened alongside arrays
        c = new Collection([new Collection(['#foo', '#bar']), ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Nested collections containing plain arrays are flattened
        c = new Collection([new Collection(['#foo', ['#bar']]), ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Nested arrays containing collections are flattened
        c = new Collection([['#foo', new Collection(['#bar'])], ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Nested arrays containing collections containing arrays are flattened
        c = new Collection([['#foo', new Collection(['#bar', ['#zap']])], ['#baz']]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#zap', '#baz']);
    });

    test('flatten with depth', (): void => {
        // No depth flattens recursively
        let c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz', '#zap']);

        // Specifying a depth only flattens to that depth
        c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
        expect(c.flatten(1).all()).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

        c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
        expect(c.flatten(2).all()).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
    });

    test('flatten ignores keys', (): void => {
        // No depth ignores keys
        let c = new Collection(['#foo', {key: '#bar'}, {key: '#baz'}]);
        expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

        // Depth of 1 ignores keys
        c = new Collection(['#foo', {key: '#bar'}, {key: '#baz'}]);
        expect(c.flatten(1).all()).toEqual(['#foo', '#bar', '#baz']);
    });

    test('merge undefined', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.merge().all()).toEqual({name: 'Hey'});
    });

    test('merge array', (): void => {
        const c = new Collection([1]);
        expect(c.merge([2]).all()).toEqual([1, 2]);
    });

    test('merge object', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.merge({id: 1}).all()).toEqual({name: 'Hey', id: 1});
    });

    test('merge collection', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.merge(new Collection({name: 'Now', id: 1})).all())
            .toEqual({name: 'Now', id: 1});
    });

    test('union null', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.union().all()).toEqual({name: 'Hey'});
    });

    test('union object', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.union({id: 1}).all()).toEqual({name: 'Hey', id: 1});
    });

    test('union collection', (): void => {
        const c = new Collection({name: 'Hey'});
        expect(c.union(new Collection({name: 'Now', id: 1})).all())
            .toEqual({name: 'Hey', id: 1});
    });

    test('diff collection', (): void => {
        const c = new Collection({id: 1, firstWord: 'Hey'});
        expect(c.diff(new Collection({firstWord: 'Hey', lastWord: 'Now'})).all())
            .toEqual({id: 1});
    });

    test('diff with collection', (): void => {
        const c = new Collection(['en_GB', 'fr', 'HR']);
        // Demonstrate that diffKeys wont support case insensitivity
        expect(c.diff(new Collection(['en_gb', 'hr'])).all())
            .toEqual(['en_GB', 'fr', 'HR']);
        // Allow for case insensitive difference
        expect(
            c.diff(
                new Collection(['en_gb', 'hr']),
                (value: string, index: number, left: unknown[], right: any): boolean => (
                    right.includes(value.toLowerCase())
                )
            ).all()
        ).toEqual(['fr']);
    });

    test('diff with undefined', (): void => {
        let c = new Collection(['en_GB', 'fr', 'HR']);
        expect(c.diff().all()).toEqual(['en_GB', 'fr', 'HR']);

        c = new Collection({id: 1, firstWord: 'Hey'});
        expect(c.diff().all()).toEqual({id: 1, firstWord: 'Hey'});
    });

    test('diff keys', (): void => {
        const c1 = new Collection({id: 1, firstWord: 'Hey'});
        let c2 = new Collection({id: 123, fooBar: 'Hey'});

        expect(c1.diffKeys(c2).all()).toEqual({firstWord: 'Hey'});

        c2 = new Collection({ID: 123, fooBar: 'Hey'});
        // Demonstrate that diffKeys won't support case insensitivity
        expect(c1.diffKeys(c2).all()).toEqual({id: 1, firstWord: 'Hey'});
        // Allow for case insensitive difference
        expect(
            c1.diffKeys(
                c2,
                (value: string, key: string, left: object, right: object): boolean => (
                    right.hasOwnProperty(key.toUpperCase())
                )
            ).all()
        ).toEqual({firstWord: 'Hey'});
    });

    test('diff assoc', (): void => {
        let c1 = new Collection({id: 1, firstWord: 'Hey', notAffected: 'value'});
        let c2 = new Collection({id: 123, fooBar: 'Hey', notAffected: 'value'});
        expect(c1.diffAssoc(c2).all()).toEqual({id: 1, firstWord: 'Hey'});

        c1 = new Collection({a: 'green', b: 'brown', c: 'blue'});
        c2 = new Collection({A: 'green'});
        // Demonstrate that the case of the keys will affect the output
        expect(c1.diffAssoc(c2).all()).toEqual({a: 'green', b: 'brown', c: 'blue'});
    });

    test('each', (): void => {
        const original = {foo: 'bar', bam: 'baz'};
        const c = new Collection(original);

        let result = {};
        c.each((item: unknown, key: string): void => {
            result[key] = item;
        });
        expect(result).toEqual(original);

        result = {};
        c.each((item: unknown, key: string): boolean | undefined => {
            result[key] = item;
            if (isString(key)) return false;
        });
        expect(result).toEqual({foo: 'bar'});
    });

    test('each spread', (): void => {
        let c = new Collection([[1, 'a'], [2, 'b']]);

        let result: any = [];
        c.eachSpread((number: number, character: string): void => {
            result.push([number, character]);
        });
        expect(c.all()).toEqual(result);

        result = [];
        c.eachSpread((number: number, character: string): boolean => {
            result.push([number, character]);

            return false;
        });
        expect(result).toEqual([[1, 'a']]);

        result = [];
        c.eachSpread((number: number, character: string, key: string): void => {
            result.push([number, character, key]);
        });
        expect(result).toEqual([[1, 'a', 0], [2, 'b', 1]]);

        c = new Collection([new Collection([1, 'a']), new Collection([2, 'b'])]);
        result = [];
        c.eachSpread((number: number, character: string): void => {
            result.push([number, character]);
        });
        expect(result).toEqual([[1, 'a'], [2, 'b']]);
    });

    test('intersect undefined', (): void => {
        const c = new Collection({id: 1, firstWord: 'Hey'});
        expect(c.intersect().all()).toEqual([]);
    });

    test('intersect collection', (): void => {
        const c = new Collection({id: 1, firstWord: 'Hey'});
        expect(c.intersect(new Collection({firstWord: 'Hey', lastWord: 'Now'})).all())
            .toEqual({firstWord: 'Hey'});
    });

    test('intersect by keys undefined', (): void => {
        const c = new Collection({name: 'Riley', age: 69});
        expect(c.intersectByKeys().all()).toEqual([]);
    });

    test('intersect by keys', (): void => {
        const c = new Collection({name: 'Riley', age: 69});
        expect(c.intersectByKeys(new Collection({name: 'Riley', surname: 'Martin'})).all())
            .toEqual({name: 'Riley'});
    });

    test('unique', (): void => {
        let c = new Collection(['Hey', 'Now', 'Now']);
        expect(c.unique().all()).toEqual(['Hey', 'Now']);

        c = new Collection([[1, 2], [1, 2], [2, 3], [3, 4], [2, 3]]);
        expect(c.unique().all()).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

    test('unique with callback', (): void => {
        const c = new Collection({
            '1': {id: 1, first: 'Eric', last: 'The Actor'},
            '2': {id: 2, first: 'Eric', last: 'The Actor'},
            '3': {id: 3, first: 'Jeff', last: 'The Actor'},
            '4': {id: 4, first: 'Jeff', last: 'The Actor'},
            '5': {id: 5, first: 'Eric', last: 'The Astronaut'},
            '6': {id: 6, first: 'Eric', last: 'The Astronaut'},
        });

        expect(c.unique('first').all()).toEqual({
            '1': {id: 1, first: 'Eric', last: 'The Actor'},
            '3': {id: 3, first: 'Jeff', last: 'The Actor'},
        });

        expect(c.unique((item: {id: number, first: string, last: string}): string => (
            `${item.first}${item.last}`
        )).all()).toEqual({
            '1': {id: 1, first: 'Eric', last: 'The Actor'},
            '3': {id: 3, first: 'Jeff', last: 'The Actor'},
            '5': {id: 5, first: 'Eric', last: 'The Astronaut'},
        });

        expect(c.unique((item: {id: number, first: string, last: string}, key: string): boolean => (
            !!(parseInt(key) % 2)
        )).all()).toEqual({
            '1': {id: 1, first: 'Eric', last: 'The Actor'},
            '2': {id: 2, first: 'Eric', last: 'The Actor'}
        });
    });

    test('unique strict', (): void => {
        const c = new Collection([
            {id: '0', name: 'zero'},
            {id: '00', name: 'double zero'},
            {id: '0', name: 'again zero'},
        ]);

        expect(c.uniqueStrict('id').all()).toEqual([
            {id: '0', name: 'zero'},
            {id: '00', name: 'double zero'},
        ]);
    });

    test('collapse', (): void => {
        const object1 = {};
        const object2 = {};
        const c = new Collection([[object1], [object2]]);
        expect(c.collapse().all()).toEqual([object1, object2]);
    });

    test('collapse with nested collections', (): void => {
        const c = new Collection([new Collection([1, 2, 3]), new Collection([4, 5, 6])]);
        expect(c.collapse().all()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('cross join', (): void => {
        // Cross join with an array
        expect((new Collection([1, 2])).crossJoin(['a', 'b']).all())
            .toEqual([[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]);

        // Cross join with a collection
        expect((new Collection([1, 2])).crossJoin(new Collection(['a', 'b'])).all())
            .toEqual([[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]);

        // Cross join with 2 collections
        expect((new Collection([1, 2])).crossJoin(new Collection(['a', 'b']), new Collection(['I', 'II'])).all())
            .toEqual([
                [1, 'a', 'I'], [1, 'a', 'II'],
                [1, 'b', 'I'], [1, 'b', 'II'],
                [2, 'a', 'I'], [2, 'a', 'II'],
                [2, 'b', 'I'], [2, 'b', 'II'],
            ]);
    });

    test('sort', (): void => {
        let c = (new Collection([5, 3, 1, 2, 4])).sort();
        expect(c.all()).toEqual([1, 2, 3, 4, 5]);

        c = (new Collection([-1, -3, -2, -4, -5, 0, 5, 3, 1, 2, 4])).sort();
        expect(c.all()).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);

        c = (new Collection(['foo', 'bar-10', 'bar-1'])).sort();
        expect(c.all()).toEqual(['bar-1', 'bar-10', 'foo']);
    });

    test('sort with callback', (): void => {
        const c = (new Collection([5, 3, 1, 2, 4]).sort((a: number, b: number): number => {
            if (a === b) return 0;

            return a < b ? -1 : 1;
        }));

        expect(c.all()).toEqual([1, 2, 3, 4, 5]);
    });

    test('sort by', (): void => {
        let c = new Collection(['riley', 'eric']);
        c = c.sortBy((x: string): string => x);

        expect(c.all()).toEqual(['eric', 'riley']);

        c = new Collection(['eric', 'riley']);
        c = c.sortByDesc((x: string): string => x);

        expect(c.all()).toEqual(['riley', 'eric']);

        c = new Collection({a: 'riley', b: 'eric'});
        c = c.sortBy((x: string): string => x);

        expect(c.all()).toEqual({b: 'eric', a: 'riley'});
    });

    test('sort by string', (): void => {
        let c = new Collection([{name: 'riley'}, {name: 'eric'}]);
        c = c.sortBy('name');

        expect(c.all()).toEqual([{name: 'eric'}, {name: 'riley'}]);

        c = new Collection([{name: 'eric'}, {name: 'riley'}]);
        c = c.sortByDesc('name');

        expect(c.all()).toEqual([{name: 'riley'}, {name: 'eric'}]);
    });

    test('sort keys', (): void => {
        const c = new Collection({b: 'eric', a: 'riley'});

        expect(c.sortKeys().all()).toEqual({a: 'riley', b: 'eric'});
    });

    test('sort keys desc', (): void => {
        const c = new Collection({a: 'riley', b: 'eric'});

        expect(c.sortKeysDesc().all()).toEqual({b: 'eric', a: 'riley'});
    });

    test('reverse', (): void => {
        let c = new Collection(['riley', 'eric']);
        expect(c.reverse().all()).toEqual(['eric', 'riley']);

        c = new Collection({name: 'riley', language: 'typescript'});
        expect(c.reverse().all()).toEqual({language: 'typescript', name: 'riley'});
    });

    test('flip', (): void => {
        const c = new Collection({name: 'riley', language: 'typescript'});
        expect(c.flip().all()).toEqual({riley: 'name', typescript: 'language'});
    });

    test('chunk', (): void => {
        let c = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        c = c.chunk(3);

        expect(c).toBeInstanceOf(Collection);
        expect(c.all()[0]).toBeInstanceOf(Collection);
        expect(c.all()).toHaveLength(4);
        expect(c.all()[0].all()).toEqual([1, 2, 3]);
        expect(c.all()[3].all()).toEqual([10]);
    });

    test('chunk when given zero as size', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(c.chunk(0).all()).toEqual([]);
    });

    test('chunk when given less than zero', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(c.chunk(-1).all()).toEqual([]);
    });

    test('every', (): void => {
        let c = new Collection([]);
        expect(c.every('key', 'value')).toBeTruthy();
        expect(c.every((): boolean => false)).toBeTruthy();

        c = new Collection([{age: 18}, {age: 20}, {age: 20}]);
        expect(c.every('age', 18)).toBeFalsy();
        expect(c.every('age', '>=', 18)).toBeTruthy();
        expect(c.every((item: {age: number}): boolean => item.age >= 18)).toBeTruthy();
        expect(c.every((item: {age: number}): boolean => item.age >= 20)).toBeFalsy();

        c = new Collection([null, null]);
        expect(c.every((item: null): boolean => item === null)).toBeTruthy();

        c = new Collection([{active: true}, {active: true}]);
        expect(c.every('active')).toBeTruthy();
        expect(c.push({key: 'active', value: false}).every('active')).toBeFalsy();
    });

    test('except', (): void => {
        const c = new Collection({first: 'Riley', last: 'Martin', email: 'riley.martin@space.com'});

        expect(c.except(['last', 'email', 'missing']).all()).toEqual({first: 'Riley'});
        expect(c.except('last', 'email', 'missing').all()).toEqual({first: 'Riley'});

        expect(c.except(new Collection(['last', 'email', 'missing'])).all()).toEqual({first: 'Riley'});
        expect(c.except(['last']).all()).toEqual({first: 'Riley', email: 'riley.martin@space.com'});
        expect(c.except('last').all()).toEqual({first: 'Riley', email: 'riley.martin@space.com'});
    });

    test('except self', (): void => {
        const c = new Collection({fist: 'Riley', last: 'Martin'});
        expect(c.except(c).all()).toEqual({});
    });

    test('pluck with array and object values', (): void => {
        const c = new Collection([{name: 'riley', email: 'foo'}, {name: 'eric', email: 'bar'}]);
        expect(c.pluck('email', 'name').all()).toEqual({riley: 'foo', eric: 'bar'});
        expect(c.pluck('email').all()).toEqual(['foo', 'bar']);
    });

    test('has', (): void => {
        const c = new Collection({id: 1, first: 'Hey', second: 'Now'});
        expect(c.has('first')).toBeTruthy();
        expect(c.has('third')).toBeFalsy();
        expect(c.has(['first', 'second'])).toBeTruthy();
        expect(c.has(['third', 'first'])).toBeFalsy();
    });

    test('implode', (): void => {
        let c = new Collection([{name: 'riley', email: 'foo'}, {name: 'eric', email: 'bar'}]);
        expect(c.implode('email')).toBe('foobar');
        expect(c.implode('email', ',')).toBe('foo,bar');

        c = new Collection(['riley', 'eric']);
        expect(c.implode('')).toBe('rileyeric');
        expect(c.implode(',')).toBe('riley,eric');
    });

    test('take', (): void => {
        let c = new Collection(['riley', 'eric', 'alice']);
        c = c.take(2);
        expect(c.all()).toEqual(['riley', 'eric']);
    });

    test('take last', (): void => {
        let c = new Collection(['riley', 'eric', 'alice']);
        c = c.take(-2);
        expect(c.all()).toEqual(['eric', 'alice']);
    });

    test('put', (): void => {
        let c = new Collection({name: 'riley', email: 'foo'});
        c = c.put('name', 'eric');
        expect(c.all()).toEqual({name: 'eric', email: 'foo'});
    });

    test('put with no key', (): void => {
        let c = new Collection(['riley', 'eric']);
        c = c.put(null, 'alice');
        expect(c.all()).toEqual(['riley', 'eric', 'alice']);
    });

    test('random', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6]);

        let random = c.random();
        expect(typeof random).toBe('number');
        expect(c.all()).toContain(random);

        random = c.random(0);
        expect(random).toBeInstanceOf(Collection);
        expect(random.all()).toHaveLength(0);

        random = c.random(1);
        expect(random).toBeInstanceOf(Collection);
        expect(random.all()).toHaveLength(1);

        random = c.random(2);
        expect(random).toBeInstanceOf(Collection);
        expect(random.all()).toHaveLength(2);
    });

    test('random on empty collection', (): void => {
        const c = new Collection;

        const random = c.random(0);
        expect(random).toBeInstanceOf(Collection);
        expect(random.all()).toHaveLength(0);
    });

    test('macroable', (): void => {
        type Macroable = Collection & {foo: Function};

        const c: Macroable = new Collection(['a', 'a', 'aa', 'aaa', 'bar']) as Macroable;
        c.foo = (): string[] => {
            return c
                .filter((item: string): boolean => item.indexOf('a') === 0)
                .unique()
                .all();
        };

        expect(c.foo()).toEqual(['a', 'aa', 'aaa']);
    });

    test('make method', (): void => {
        const c = Collection.make('foo');
        expect(c.all()).toEqual(['foo']);
    });

    test('make method from undefined', (): void => {
        const c = Collection.make();
        expect(c.all()).toEqual([]);
    });

    test('make method from collection', (): void => {
        const first = Collection.make({foo: 'bar'});
        const second = Collection.make(first);
        expect(second.all()).toEqual({foo: 'bar'});
    });

    test('make method from object', (): void => {
        const c = Collection.make({foo: 'bar'});
        expect(c.all()).toEqual({foo: 'bar'});
    });

    test('wrap with scalar', (): void => {
        const c = Collection.wrap('foo');
        expect(c.all()).toEqual(['foo']);
    });

    test('wrap with array', (): void => {
        const c = Collection.wrap(['foo']);
        expect(c.all()).toEqual(['foo']);
    });

    test('wrap with arrayable', (): void => {
        const o = new TestArrayableObject;
        const c = Collection.wrap(o);
        expect(c.all()).toEqual([o]);
    });

    test('wrap with objectable', (): void => {
        const o = new TestObjectableObject;
        const c = Collection.wrap(o);
        expect(c.all()).toEqual([o]);
    });

    test('wrap with jsonable', (): void => {
        const o = new TestJsonableObject;
        const c = Collection.wrap(o);
        expect(c.all()).toEqual([o]);
    });

    test('wrap with json serialize', (): void => {
        const o = new TestJsonSerializeObject;
        const c = Collection.wrap(o);
        expect(c.all()).toEqual([o]);
    });

    test('wrap with collection class', (): void => {
        const c = Collection.wrap(Collection.make(['foo']));
        expect(c.all()).toEqual(['foo']);
    });

    test('wrap with collection subclass', (): void => {
        const c = TestCollectionSubclass.wrap(Collection.make(['foo']));
        expect(c.all()).toEqual(['foo']);
        expect(c).toBeInstanceOf(TestCollectionSubclass);
    });

    test('unwrap collection', (): void => {
        const c = new Collection(['foo']);
        expect(Collection.unwrap(c)).toEqual(['foo']);
    });

    test('unwrap collection with array', (): void => {
        expect(Collection.unwrap(['foo'])).toEqual(['foo']);
    });

    test('unwrap collection with scalar', (): void => {
        expect(Collection.unwrap('foo')).toEqual('foo');
    });

    test('times method', (): void => {
        const two = Collection.times(2, (number: number): string => `slug-${number}`);

        const zero = Collection.times(0, (number: number): string => `slug-${number}`);

        const negative = Collection.times(-4, (number: number): string => `slug-${number}`);

        const range = Collection.times(5);

        expect(two.all()).toEqual(['slug-1', 'slug-2']);
        expect(zero.isEmpty()).toBeTruthy();
        expect(negative.isEmpty()).toBeTruthy();
        expect(range.all()).toEqual([1, 2, 3, 4, 5]);
    });

    test('construct make from object', (): void => {
        const c = Collection.make({foo: 'bar'});
        expect(c.all()).toEqual({foo: 'bar'});
    });

    test('construct method', (): void => {
        const c = new Collection('foo');
        expect(c.all()).toEqual(['foo']);
    });

    test('construct method from undefined', (): void => {
        const c = new Collection;
        expect(c.all()).toEqual([]);
    });

    test('construct method from collection', (): void => {
        const first = new Collection({foo: 'bar'});
        const second = new Collection(first);
        expect(second.all()).toEqual({foo: 'bar'});
    });

    test('construct method from array', (): void => {
        const c = new Collection(['foo', 'bar']);
        expect(c.all()).toEqual(['foo', 'bar']);
    });

    test('construct method from object', (): void => {
        const c = new Collection({foo: 'bar'});
        expect(c.all()).toEqual({foo: 'bar'});
    });

    test('splice', (): void => {
        let c = new Collection(['foo', 'baz']);
        c.splice(1);
        expect(c.all()).toEqual(['foo']);

        c = new Collection(['foo', 'baz']);
        c.splice(1, 0, 'bar');
        expect(c.all()).toEqual(['foo', 'bar', 'baz']);

        c = new Collection(['foo', 'baz']);
        c.splice(1, 1);
        expect(c.all()).toEqual(['foo']);

        c = new Collection(['foo', 'baz']);
        const cut = c.splice(1, 1, 'bar');
        expect(c.all()).toEqual(['foo', 'bar']);
        expect(cut.all()).toEqual(['baz']);
    });

    test('map', (): void => {
        let c = new Collection({first: 'riley', last: 'martin'});
        c = c.map((item: string, key: string): string => (
            `${key}-${item.split('').reverse().join('')}`
        ));
        expect(c.all()).toEqual({first: 'first-yelir', last: 'last-nitram'});
    });

    test('map spread', (): void => {
        let c = new Collection([[1, 'a'], [2, 'b']]);

        let result = c.mapSpread((number: number, character: string): string => (
            `${number}-${character}`
        ));
        expect(result.all()).toEqual(['1-a', '2-b']);

        result = c.mapSpread((number: number, character: string, index: number): string => (
            `${number}-${character}-${index}`
        ));
        expect(result.all()).toEqual(['1-a-0', '2-b-1']);

        c = new Collection([new Collection([1, 'a']), new Collection([2, 'b'])]);
        result = c.mapSpread((number: number, character: string, index: number): string => (
            `${number}-${character}-${index}`
        ));
        expect(result.all()).toEqual(['1-a-0', '2-b-1']);
    });

    test('flat map', (): void => {
        let c = new Collection([
            {name: 'riley', hobbies: ['space', 'aliens']},
            {name: 'eric', hobbies: ['jfsc', 'idol']},
        ]);
        c = c.flatMap((person: {name: string, hobbies: string[]}): string[] => (
            person.hobbies
        ));
        expect(c.all()).toEqual(['space', 'aliens', 'jfsc', 'idol']);
    });

    test('map to dictionary', (): void => {
        const c = new Collection([
            {id: 1, name: 'A'},
            {id: 2, name: 'B'},
            {id: 3, name: 'C'},
            {id: 4, name: 'B'},
        ]);

        const groups = c.mapToDictionary((item: {id: string, name: string}, key: string): object => ({
            [item.name]: item.id
        }));

        expect(groups).toBeInstanceOf(Collection);
        expect(groups.all()).toEqual({A: [1], B: [2, 4], C: [3]});
        expect(groups.get('A')).toBeInstanceOf(Array);
    });

    test('map to dictionary with numeric keys', (): void => {
        const c = new Collection([1, 2, 3, 2, 1]);

        const groups = c.mapToDictionary((item: number, key: number): object => ({
            [item]: key
        }));

        expect(groups.all()).toEqual({'1': [0, 4], '2': [1, 3], '3': [2]});
    });

    test('map to groups', (): void => {
        const c = new Collection([
            {id: 1, name: 'A'},
            {id: 2, name: 'B'},
            {id: 3, name: 'C'},
            {id: 4, name: 'B'},
        ]);

        const groups = c.mapToGroups((item: {id: string, name: string}, key: string): object => ({
            [item.name]: item.id
        }));

        expect(groups).toBeInstanceOf(Collection);
        expect(groups.toPrimitive()).toEqual({A: [1], B: [2, 4], C: [3]});
        expect(groups.get('A')).toBeInstanceOf(Collection);
    });

    test('map to groups with numeric keys', (): void => {
        const c = new Collection([1, 2, 3, 2, 1]);

        const groups = c.mapToGroups((item: number, key: number): object => ({
            [item]: key
        }));

        expect(groups.toPrimitive()).toEqual({'1': [0, 4], '2': [1, 3], '3': [2]});
    });

    test('map with keys', (): void => {
        let c = new Collection([
            {name: 'Riley', lastname: 'Martin'},
            {name: 'Eric', lastname: 'Lynch'},
            {name: 'Lester', lastname: 'Green'},
        ]);
        c = c.mapWithKeys((wackpacker: {name: string, lastname: string}): object => ({
            [wackpacker.name]: wackpacker.lastname
        }));
        expect(c.all()).toEqual({Riley: 'Martin', Eric: 'Lynch', Lester: 'Green'});
    });

    test('map with keys integer keys', (): void => {
        let c = new Collection([
            {id: 1, name: 'A'},
            {id: 3, name: 'B'},
            {id: 2, name: 'C'},
        ]);
        c = c.mapWithKeys((item: {id: number, name: string}): object => ({
            [item.id.toString()]: item
        }));
        expect(c.keys().all()).toEqual(['1', '2', '3']);
    });

    test('map with keys multiple rows', (): void => {
        let c = new Collection([
            {id: 1, name: 'A'},
            {id: 2, name: 'B'},
            {id: 3, name: 'C'},
        ]);
        c = c.mapWithKeys((item: {id: number, name: string}): object => ({
            [item.id]: item.name, [item.name]: item.id
        }));
        expect(c.all()).toEqual({
            '1': 'A',
            '2': 'B',
            '3': 'C',
            A: 1,
            B: 2,
            C: 3
        });
    });

    test('map with keys callback key', (): void => {
        let c = new Collection({
            '3': {id: 1, name: 'A'},
            '5': {id: 3, name: 'B'},
            '4': {id: 2, name: 'C'},
        });
        c = c.mapWithKeys((item: {id: number, name: string}, key: string): object => ({
            [key]: item.id
        }));
        expect(c.keys().all()).toEqual(['3', '4', '5']);
    });

    test('map into', (): void => {
        let c = new Collection(['first', 'second']);

        c = c.mapInto(TestCollectionMapIntoObject);

        expect(c.get(0).value).toEqual('first');
        expect(c.get(1).value).toEqual('second');
    });

    test('map with keys overwriting keys', (): void => {
        let c = new Collection([
            {id: 1, name: 'A'},
            {id: 2, name: 'B'},
            {id: 1, name: 'C'},
        ]);
        c = c.mapWithKeys((item: {id: number, name: string}): object => ({
            [item.id]: item.name
        }));
        expect(c.all()).toEqual({'1': 'C', '2': 'B'});
    });

    test('nth', (): void => {
        const c = new Collection(['a', 'b', 'c', 'd', 'e', 'f']);

        expect(c.nth(4).all()).toEqual(['a', 'e']);
        expect(c.nth(4, 1).all()).toEqual(['b', 'f']);
        expect(c.nth(4, 2).all()).toEqual(['c']);
        expect(c.nth(4, 3).all()).toEqual(['d']);
    });

    test('slice offset', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(3).all()).toEqual([4, 5, 6, 7, 8]);
    });

    test('slice negative offset', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(-3).all()).toEqual([6, 7, 8]);
    });

    test('slice offset and length', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(3, 3).all()).toEqual([4, 5, 6]);
    });

    test('slice offset and negative length', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(3, -1).all()).toEqual([4, 5, 6, 7]);
    });

    test('slice negative offset and length', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(-5, 3).all()).toEqual([4, 5, 6]);
    });

    test('slice negative offset and negative length', (): void => {
        const c = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(c.slice(-6, -2).all()).toEqual([3, 4, 5, 6]);
    });

    test('split collection with a divisable count', (): void => {
        let c = new Collection(['a', 'b', 'c', 'd']);

        expect(c.split(2).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a', 'b'], ['c', 'd']]);

        c = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        expect(c.split(2).map((chunk: Collection): number[] => chunk.all()).all())
            .toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]);
    });

    test('split collection with an undivisable count', (): void => {
        const c = new Collection(['a', 'b', 'c']);

        expect(c.split(2).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a', 'b'], ['c']]);
    });

    test('split collection with count less then divisor', (): void => {
        const c = new Collection(['a']);

        expect(c.split(2).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a']]);
    });

    test('split collection into three with count of four', (): void => {
        const c = new Collection(['a', 'b', 'c', 'd']);

        expect(c.split(3).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a', 'b'], ['c'], ['d']]);
    });

    test('split collection into three with count of five', (): void => {
        const c = new Collection(['a', 'b', 'c', 'd', 'e']);

        expect(c.split(3).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    });

    test('split collection into six with count of ten', (): void => {
        const c = new Collection(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);

        expect(c.split(6).map((chunk: Collection): string[] => chunk.all()).all())
            .toEqual([['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i'], ['j']]);
    });

    test('split empty collection', (): void => {
        const c = new Collection;

        expect(c.split(2).map((chunk: Collection): unknown[] => chunk.all()).all())
            .toEqual([]);
    });
});

class TestArrayableObject implements IArrayable {

    public toArray(): number[] {
        return [1, 2, 3];
    }

}

class TestObjectableObject implements IObjectable {

    public toObject(): object {
        return {foo: 'bar'};
    }

}

class TestJsonableObject implements IJsonable {

    public toJson(): string {
        return '{"foo":"bar"}';
    }

}

class TestJsonSerializeObject implements IJsonSerializable {

    public jsonSerialize(): object {
        return {foo: 'bar'};
    }

}

class TestCollectionMapIntoObject {

    public value: string;

    public constructor(value: string) {
        this.value = value;
    }

}

class TestCollectionSubclass extends Collection {}
