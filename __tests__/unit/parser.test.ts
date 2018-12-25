import {parse} from 'cherow';

import injectable from '@src/Support/injectable';
import ClassAnalyserManager from '@src/Parsing/Analysers/ClassAnalyserManager';
import ExpressionCollectorStub from '@helpers/Stubs/ExpressionCollectorStub';
import * as ParserStubs from '@helpers/Stubs/ParserStubs';

describe('Parser', (): void => {
    it('parser manager', (): void => {

        const ast = parse(ParserStubs.ClassWithPublicStaticMethodStub.toString());
        // const ast = parse(`failingObjectExpression = ${ExpressionCollectorStub.prototype.failingObjectExpression.toString()}`);
        console.log(JSON.stringify(ast, null, 4));

        expect(true).toBeTruthy();
    });
});
