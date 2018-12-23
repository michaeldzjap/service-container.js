import {parse} from 'cherow';

import injectable from '@src/Support/injectable';
import ClassAnalyserManager from '@src/Parsing/Analysers/ClassAnalyserManager';

class Stub {}

class B {

    public publicMethod(): number {
        const a = true;

        if (a) return 111;

        return 333;
    }

}

@injectable()
class A {

    private _a: string;
    private _b: number;
    private _c: Stub;

    public constructor(a: string, b: number = 333, c: Stub, d: number[][] = [[1], [2], [3]]) {
        this._a = a;
        this._b = b;
        this._c = c;
    }

    public static publicStaticMethod(): number[] {
        const a = true;

        if (a) {
            return [1, 2, 3];
        }

        return [100, 200, 300];
    }

    public publicMethod(): void {
        //
    }

    private _privateMethod(): void {
        //
    }

}

function ordinaryFunction(a: number, b: string = 'Hey now!'): number[] {
    const c = true;

    if (c) return [111, 222, 333];

    return [1, 2, 3];
}

describe('Parser', (): void => {
    it('parser manager', (): void => {
        // console.log(JSON.stringify(parse(Stub.toString()), null, 4));

        const analyser = (new ClassAnalyserManager(A)).driver();
        const params = analyser.getConstructorAnalyser().getParameterAnalyser().all();
        console.log(JSON.stringify(params, null, 4));
        // const ast = manager.ast(A.publicStaticMethod);
        // const fn = Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod')!.value;
        // console.log(A.prototype.publicMethod.toString());
        // const ast = manager.ast(fn);

        // console.log(Reflect.getOwnPropertyDescriptor(Stub.prototype, 'constructor'));
        // console.log(JSON.stringify(ast, null, 4));
        // console.log(typeof ast.body[0].body.body[3].argument.elements[0].value);
        // console.log(Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod'));

        expect(true).toBeTruthy();
    });
});
