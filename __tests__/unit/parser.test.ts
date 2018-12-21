import ParserManager from '@src/Parsing/ParserManager';

class Stub {}

class B {

    public publicMethod(): number {
        return 333;
    }

}

class A {

    private _a: string;
    private _b: number;
    private _c: Stub;

    public constructor(a: string, b: number = 333, c: Stub, d: number[][] = [[1], [2], [3]]) {
        this._a = a;
        this._b = b;
        this._c = c;
    }

    public static publicStaticMethod(): void {
        //
    }

    public publicMethod(): void {
        //
    }

    private _privateMethod(): void {
        //
    }

}

describe('Parser', (): void => {
    it('parser manager', (): void => {
        const manager = new ParserManager;
        const ast = manager.ast(A);
        // const ast = manager.ast(A.publicStaticMethod);
        // const fn = Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod')!.value;
        // console.log(A.prototype.publicMethod.toString());
        // const ast = manager.ast(fn);

        // console.log(Reflect.getOwnPropertyDescriptor(Stub.prototype, 'constructor'));
        console.log(JSON.stringify(ast, null, 4));
        // console.log(Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod'));
    });
});
