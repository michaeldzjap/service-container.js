import injectable from '@src/Support/injectable';
import {IParserContractStub} from '@helpers/Contracts/IParserContractStub';

export class SimpleStub {}

@injectable()
export class ClassWithConstructorStub {

    private _a: number;
    private _b: string;
    private _c: Array<number>;
    private _d: IParserContractStub;

    public constructor(a: number, b: string = 'Hey now!', c: Array<number> = [1, 2, 3],
        @IParserContractStub d: IParserContractStub) {
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
    }

}

@injectable()
export class ClassWithSimpleConstructorStub {

    private _a: number;

    public constructor() {
        this._a = 1;
    }

}

@injectable()
export class ClassWithoutConstructorStub {

    public someMethod(): void {
        //
    }

}

@injectable()
export class ClassWithoutBodyStub {}

export class ClassWithPublicMethodStub {

    @injectable()
    public someMethod(a: number, b: string = 'Hey now!', c: Array<number> = [1, 2, 3],
        @IParserContractStub d: IParserContractStub): void {
        //
    }

}

export class ClassWithPublicStaticMethodStub {

    @injectable()
    public static someMethod(a: number, b: string = 'Hey now!', c: Array<number> = [1, 2, 3],
        @IParserContractStub d: IParserContractStub): void {
        //
    }

}
