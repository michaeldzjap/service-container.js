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
 * A class for generating random numbers. Several different (seedable) random
 * number generator algorithms are configurable.
 *
 * See https://stackoverflow.com/a/47593316/7024747 for more info.
 */
class Rand {

    /**
     * The string that will be used for generating a suitable hash for any of
     * the provided PRNG algorithms.
     *
     * @var {string}
     */
    private _str?: string;

    /**
     * The PRNG algorithm that should be used for random number generation.
     *
     * @var {PRNG}
     */
    private _prng: PRNG;

    /**
     * The generator that should be used for generating random numbers.
     *
     * @var {Function}
     */
    private _generator: Function;

    /**
     * Create a new rand instance.
     *
     * @param {string} str
     * @param {PRNG} prng
     */
    public constructor(str?: string, prng: PRNG = PRNG.sfc32) {
        this._str = str;
        this._prng = prng;
        this._generator = this._initializeGenerator();
    }

    /**
     * Generate a hash from a string that is suitable to use as a seed for any
     * of the provided PRNG's.
     *
     * @param {string} str
     * @returns {Function}
     */
    private static _xfnv1a(str: string): Function {
        let h = 2166136261 >>> 0;

        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        }

        return (): number => {
            h += h << 13; h ^= h >>> 7;
            h += h << 3; h ^= h >>> 17;

            return (h += h << 5) >>> 0;
        };
    }

    /**
     * Generate a random number using the sfc32 algorithm.
     *
     * @param {string} str
     * @returns {Function}
     */
    private static _sfc32(str: string): Function {
        const seed = Rand._xfnv1a(str);
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
    }

    /**
     * Generate a random number using the Mulberry32 algorithm.
     *
     * @param {string} str
     * @returns {Function}
     */
    private static _mulberry32(str: string): Function {
        let a = Rand._xfnv1a(str)();

        return (): number => {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);

            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    /**
     * Generate a random number using the xoshiro128** algorithm.
     *
     * @param {string} str
     * @returns {Function}
     */
    private static _xoshiro128ss(str: string): Function {
        const seed = Rand._xfnv1a(str);
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
    }

    /**
     * Generate a new random number using the selected generator.
     *
     * @returns {number}
     */
    public next(): number {
        return this._generator();
    }

    /**
     * Initialize the chosen random number generator.
     *
     * @returns {Function}
     */
    private _initializeGenerator(): Function {
        if (isNullOrUndefined(this._str)) return Math.random;

        switch (this._prng) {
            case 'sfc32':
                return Rand._sfc32(this._str);
            case 'mulberry32':
                return Rand._mulberry32(this._str);
            case 'xoshiro128ss':
                return Rand._xoshiro128ss(this._str);
            default:
                return Math.random;
        }
    }

}

export default Rand;
