import Arrayable from '@src/Contracts/Arrayable';
import Jsonable from '@src/Contracts/Jsonable';
import JsonSerializable from '@src/Contracts/JsonSerializable';
import Objectable from '@src/Contracts/Objectable';

export class ArrayableObjectStub implements Arrayable {

    public toArray(): number[] {
        return [1, 2, 3];
    }

}

export class ObjectableObjectStub implements Objectable {

    public toObject(): object {
        return {foo: 'bar'};
    }

}

export class JsonableObjectStub implements Jsonable {

    public toJson(): string {
        return '{"foo":"bar"}';
    }

}

export class JsonSerializeObjectStub implements JsonSerializable {

    public jsonSerialize(): object {
        return {foo: 'bar'};
    }

}
