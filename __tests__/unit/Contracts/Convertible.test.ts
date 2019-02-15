import Arrayable, {isArrayable} from '@src/Contracts/Arrayable';
import Objectable, {isObjectable} from '@src/Contracts/Objectable';
import Jsonable, {isJsonable} from '@src/Contracts/Jsonable';
import JsonSerializable, {isJsonSerializable} from '@src/Contracts/JsonSerializable';
import {
    ArrayableObjectStub, ObjectableObjectStub, JsonableObjectStub,
    JsonSerializeObjectStub
} from '@helpers/Stubs/ConvertibleStubs';

class PlainStub {}

describe('Convertible', (): void => {
    it('converts an instance implementing the arrayable interface to an array', (): void => {
        const obj1 = new ArrayableObjectStub;
        const obj2 = new PlainStub;

        expect(obj1.toArray()).toEqual([1, 2, 3]);
        expect(isArrayable(obj1)).toBeTruthy();
        expect(isArrayable(obj2)).toBeFalsy();
        expect(isArrayable('a')).toBeFalsy();
    });

    it('converts an instance implementing the objectable interface to an object', (): void => {
        const obj1 = new ObjectableObjectStub;
        const obj2 = new PlainStub;

        expect(obj1.toObject()).toEqual({foo: 'bar'});
        expect(isObjectable(obj1)).toBeTruthy();
        expect(isObjectable(obj2)).toBeFalsy();
        expect(isObjectable('a')).toBeFalsy();
    });

    it('converts an instance implementing the jsonable interface to a string', (): void => {
        const obj1 = new JsonableObjectStub;
        const obj2 = new PlainStub;

        expect(obj1.toJson()).toEqual('{"foo":"bar"}');
        expect(isJsonable(obj1)).toBeTruthy();
        expect(isJsonable(obj2)).toBeFalsy();
        expect(isJsonable('a')).toBeFalsy();
    });

    it('converts an instance implementing the jsonserializable interface to something that is json serializable', (): void => {
        const obj1 = new JsonSerializeObjectStub;
        const obj2 = new PlainStub;

        expect(obj1.jsonSerialize()).toEqual({foo: 'bar'});
        expect(isJsonSerializable(obj1)).toBeTruthy();
        expect(isJsonSerializable(obj2)).toBeFalsy();
        expect(isJsonSerializable('a')).toBeFalsy();
    });
});
