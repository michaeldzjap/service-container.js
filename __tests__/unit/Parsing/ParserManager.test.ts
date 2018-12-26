import CherowParser from '@src/Parsing/Parsers/CherowParser';
import ParserManager from '@src/Parsing/ParserManager';
import {SimpleStub} from '@helpers/Stubs/ParserStubs';

describe('ParserManager', (): void => {
    it('instantiates a new parser manager instance', (): void => {
        const manager = new ParserManager;

        expect(manager).toBeInstanceOf(ParserManager);
    });

    [
        {type: CherowParser},
        {driver: 'cherow', type: CherowParser},
    ].forEach(({driver, type}): void => {
        it(`returns the [${driver}] parser`, (): void => {
            const manager = new ParserManager;
            const parser = manager.driver();

            expect(parser).toBeInstanceOf(type);
        });
    });

    it('throws an error when attempting to resolve a non-existent driver', (): void => {
        const manager = new ParserManager;
        const fn = (): any => manager.driver('non-existent'); // eslint-disable-line require-jsdoc

        expect(fn).toThrow('Driver [non-existent] is not supported.');
    });

    it('returns the ast', (): void => {
        const manager = new ParserManager;
        const ast = manager.ast(SimpleStub);

        expect(ast).toBeInstanceOf(Object);
    });
});
