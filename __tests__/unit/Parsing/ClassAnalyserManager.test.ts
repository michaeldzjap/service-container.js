import ClassAnalyserManager from '@src/Parsing/Analysers/ClassAnalyserManager';
import ParserManager from '@src/Parsing/ParserManager';
import {SimpleStub} from '@helpers/Stubs/ParserStubs';
import * as tsConfig from '@base/tsconfig.base.json';

describe('ClassAnalyserManager', (): void => {
    it('instantiates a new parser manager instance', (): void => {
        const ast = (new ParserManager).ast(SimpleStub.toString());
        const manager = new ClassAnalyserManager(ast.body[0]);

        expect(manager).toBeInstanceOf(ClassAnalyserManager);
    });

    it('returns the ECMAScript target as defined in the TypeScript config as the default driver', (): void => {
        const ast = (new ParserManager).ast(SimpleStub.toString());
        const manager = new ClassAnalyserManager(ast.body[0]);
        const TARGET = manager.getDefaultDriver();

        expect(TARGET).toBe(tsConfig.compilerOptions.target);
    });
});
