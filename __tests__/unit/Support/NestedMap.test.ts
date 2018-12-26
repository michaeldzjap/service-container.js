import NestedMap from '@src/Support/NestedMap/.';

class KeyStub {}

describe('NestedMap', (): void => {
    const EXPECTED = 333;
    const DATA_PROVIDER = [
        {key: 'eric.the.actor', expected: EXPECTED},
        {key: ['eric', 'the', 'actor'], expected: EXPECTED},
    ];

    it('sets a non-nested element of a map to the given value', (): void => {
        const map = new NestedMap;

        const result = map.set(KeyStub, EXPECTED);

        expect(result).toBeInstanceOf(NestedMap);
        expect(result.get(KeyStub)).toBe(EXPECTED);
    });

    it('adds or updates a nested element of a map to the given value', (): void => {
        DATA_PROVIDER.forEach(({key, expected}): void => {
            const map = new NestedMap;

            const result = map.set(key, expected);

            expect(result).toBeInstanceOf(NestedMap);
            expect(result.get('eric')).toBeInstanceOf(Map);
            expect(result.get('eric').get('the')).toBeInstanceOf(Map);
            expect(result.get('eric').get('the').get('actor')).toBe(expected);
        });
    });

    it('returns a nested element of a map', (): void => {
        DATA_PROVIDER.forEach(({key, expected}): void => {
            const map = new NestedMap;

            map.set(key, expected);
            const result = map.get(key);

            expect(result).toBe(expected);
        });
    });

    it('returns undefined if a map does not contain the nested element', (): void => {
        DATA_PROVIDER.forEach(({key}): void => {
            const map = new NestedMap;

            const result = map.get(key);

            expect(result).toBeUndefined();
        });
    });

    it('checks if a map contains a nested element', (): void => {
        DATA_PROVIDER.forEach(({key}): void => {
            const map = new NestedMap;

            const result = map.has(key);

            expect(result).toBeFalsy();
        });

        DATA_PROVIDER.forEach(({key, expected}): void => {
            const map = new NestedMap;

            map.set(key, expected);
            const result = map.has(key);

            expect(result).toBeTruthy();
        });
    });

    it('removes a nested element from a map', (): void => {
        DATA_PROVIDER.forEach(({key}): void => {
            const map = new NestedMap;

            const result = map.delete(key);

            expect(result).toBeFalsy();
        });

        DATA_PROVIDER.forEach(({key, expected}): void => {
            const map = new NestedMap;

            // Set an element
            map.set(key, expected);
            let result = map.has(key);

            expect(result).toBeTruthy();

            // Now delete the element
            result = map.delete(key);

            expect(result).toBeTruthy();
            expect(map.has(key)).toBeFalsy();
        });
    });

    it('removes the nested element, but keeps any child elements of a map', (): void => {
        const map = new NestedMap;
        const KEY_TO_REMOVE = 'eric.the.actor';
        const KEY_TO_KEEP = 'eric.the.extra';

        // Set an element and another child element
        map.set(KEY_TO_REMOVE, EXPECTED);
        map.set(KEY_TO_KEEP, EXPECTED);

        expect(map.has(KEY_TO_REMOVE)).toBeTruthy();
        expect(map.has(KEY_TO_KEEP)).toBeTruthy();

        // Now delete the element
        const result = map.delete(KEY_TO_REMOVE);
        expect(result).toBeTruthy();
        expect(map.has(KEY_TO_REMOVE)).toBeFalsy();
        expect(map.has(KEY_TO_KEEP)).toBeTruthy();
    });
});
