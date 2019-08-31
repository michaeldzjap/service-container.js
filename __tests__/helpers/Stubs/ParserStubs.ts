import {ParserContractStub} from '@helpers/Contracts/ParserContractStub';

export class SimpleStub {}

export class ClassWithConstructorStub {

    private _a: number;
    private _b: string;
    private _c: number[];
    private _d: ParserContractStub;

    public constructor(a: number, b = 'Hey now!', c: number[] = [1, 2, 3],
        @ParserContractStub d: ParserContractStub) {
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
    }

}

export class ClassWithSimpleConstructorStub {

    private _a: number;

    public constructor() {
        this._a = 1;
    }

}

export class ClassWithoutConstructorStub {

    public someMethod(): void {
        //
    }

}

export class ClassWithoutBodyStub {}

export class ClassWithPublicMethodStub {

    public someMethod(a: number, b = 'Hey now!', c: number[] = [1, 2, 3],
        @ParserContractStub d: ParserContractStub): void {
        //
    }

}

export class ClassWithPublicStaticMethodStub {

    public static someMethod(a: number, b = 'Hey now!', c: number[] = [1, 2, 3],
        @ParserContractStub d: ParserContractStub): void {
        //
    }

}
