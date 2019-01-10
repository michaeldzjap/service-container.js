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
