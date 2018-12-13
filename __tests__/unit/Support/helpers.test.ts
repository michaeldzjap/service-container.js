import {isClass} from '@src/Support/helpers';

describe('helpers', (): void => {
    class ClassStub {}

    [
        {target: (): void => {}, name: 'arrow function', expected: false},
        {target: function (): void {}, name: 'unnamed function', expected: false}, // eslint-disable-line object-shorthand, no-empty-function
        {target(): void {}, name: 'named function', expected: false}, // eslint-disable-line no-empty-function
        {target: ClassStub, name: 'class definition', expected: true},
        {target: String, name: 'built in class definition', expected: true},
        {target: {a: 1}, name: 'object instance', expected: false},
        {target: [1, 2, 3], name: 'array instance', expected: false},
        {target: 1, name: 'number', expected: false},
    ].forEach(({target, name, expected}): void => {
        it(`determines if the target [${name}] is a class definition`, (): void => {
            const result = isClass(target);

            expect(result).toBe(expected);
        });
    });
});
