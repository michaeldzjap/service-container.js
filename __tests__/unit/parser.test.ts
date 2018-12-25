import {parse} from 'cherow';

import injectable from '@src/Support/injectable';
import ClassAnalyserManager from '@src/Parsing/Analysers/ClassAnalyserManager';
import ExpressionCollectorStub from '@helpers/Stubs/ExpressionCollectorStub';

// class FailStub {}
//
// class Stub {
//
//     public failingArrayExpression(arr = [new FailStub]): void {
//         //
//     }
//
//     public mixedSimpleArrayExpression(arr = [1, '2', {a: 1, b: 2, c: 3}]): void {
//         //
//     }
//
// }

// class Dummy {}
//
// class Stub {
//
//     public method(arr = [new Dummy]): void {
//         //
//     }
//
// }
//
// class B {
//
//     public publicMethod(): number {
//         const a = true;
//
//         if (a) return 111;
//
//         return 333;
//     }
//
// }
//
// @injectable()
// class A {
//
//     private _a: string;
//     private _b: number;
//     private _c: Stub;
//
//     public constructor(a: string, b: number = 333, c: Stub, d: number[][] = [[1], [2], [3]]) {
//         this._a = a;
//         this._b = b;
//         this._c = c;
//     }
//
//     public static publicStaticMethod(a: Number = 333): void {
//         //
//     }
//
//     public publicMethod(): void {
//         //
//     }
//
//     private _privateMethod(): void {
//         //
//     }
//
// }
//
// function ordinaryFunction(a: number, b: string = 'Hey now!'): number[] {
//     const c = true;
//
//     if (c) return [111, 222, 333];
//
//     return [1, 2, 3];
// }

describe('Parser', (): void => {
    it('parser manager', (): void => {
        // console.log(JSON.stringify(parse(Stub.toString()), null, 4));

        // const analyser = (new ClassAnalyserManager(A)).driver();
        // const params = analyser.getConstructorAnalyser().getParameterAnalyser().all();
        // console.log(JSON.stringify(params, null, 4));
        // const ast = manager.ast(A.publicStaticMethod);
        // const fn = Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod')!.value;
        // const fn = Stub.prototype.method;
        // const parsed = parse(`fn = ${fn.toString()}`);
        // console.log(JSON.stringify(parsed, null, 4));
        // const ast = manager.ast(fn);

        // const ast = parse(ExpressionCollectorStub.toString());
        const ast = parse(`failingObjectExpression = ${ExpressionCollectorStub.prototype.failingObjectExpression.toString()}`);
        console.log(JSON.stringify(ast, null, 4));

        // const ast = parse(JSON.stringify([new Dummy]));
        // console.log(JSON.stringify(ast, null, 4));
        // console.log(JSON.stringify([new Dummy], null, 4));

        // console.log(Reflect.getOwnPropertyDescriptor(Stub.prototype, 'constructor'));
        // console.log(JSON.stringify(ast, null, 4));
        // console.log(typeof ast.body[0].body.body[3].argument.elements[0].value);
        // console.log(Reflect.getOwnPropertyDescriptor(A, 'publicStaticMethod'));

        expect(true).toBeTruthy();
    });
});
