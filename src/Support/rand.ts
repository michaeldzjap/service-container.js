import {isNullOrUndefined} from './helpers';

/**
 * Available seedable random number generator algorithms.
 *
 * @var {PRNG}
 */
export enum PRNG {
    sfc32 = 'sfc32',
    mulberry32 = 'mulberry32',
    xoshiro128ss = 'xoshiro128ss'
}

/**
 * Generate a hash from a string that is suitable to use as a seed for any of
 * the provided PRNG's.
 *
 * @param {string} str
 * @returns {Function}
 */
const xfnv1a = (str: string): Function => {
    let h = 2166136261 >>> 0;

    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }

    return (): number => {
        h += h << 13; h ^= h >>> 7;
        h += h << 3; h ^= h >>> 17;

        return (h += h << 5) >>> 0;
    };
};

/**
 * Generate a random number using the sfc32 algorithm.
 *
 * @param {string} str
 * @returns {Function}
 */
const sfc32 = (str: string): Function => {
    const seed = xfnv1a(str);
    let a = seed();
    let b = seed();
    let c = seed();
    let d = seed();

    return (): number => {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;

        return (t >>> 0) / 4294967296;
    };
};

/**
 * Generate a random number using the Mulberry32 algorithm.
 *
 * @param {string} str
 * @returns {Function}
 */
const mulberry32 = (str: string): Function => {
    let a = xfnv1a(str)();

    return (): number => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);

        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
};

/**
 * Generate a random number using the xoshiro128** algorithm.
 *
 * @param {string} str
 * @returns {Function}
 */
const xoshiro128ss = (str: string): Function => {
    const seed = xfnv1a(str);
    let a = seed();
    let b = seed();
    let c = seed();
    let d = seed();

    return (): number => {
        const t = b << 9;
        let r = a * 5;
        r = (r << 7 | r >>> 25) * 9;
        c ^= a; d ^= b;
        b ^= c; a ^= d; c ^= t;
        d = d << 11 | d >>> 21;

        return (r >>> 0) / 4294967296;
    };
};

/**
 * Generate a random number with optional seed.
 *
 * See https://stackoverflow.com/a/47593316/7024747
 *
 * @param {string} str
 * @param {PRNG} prng
 * @returns {number}
 */
export const generator = (str?: string, prng: PRNG = PRNG.sfc32): Function => {
    if (isNullOrUndefined(str)) return Math.random;

    switch (prng) {
        case 'sfc32':
            return sfc32(str as string);
        case 'mulberry32':
            return mulberry32(str as string);
        default:
            return xoshiro128ss(str as string);
    }
};
