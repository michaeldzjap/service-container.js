import Collection from '@src/Support/Collection';
import IArrayable from '@src/Contracts/IArrayable';
import IJsonable from '@src/Contracts/IJsonable';
import IJsonSerializable from '@src/Contracts/IJsonSerializable';
import IObjectable from '@src/Contracts/IObjectable';

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
            Collection.prototype, '_getArrayableItems'
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
