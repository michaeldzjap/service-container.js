import * as tsConfig from '../../tsconfig.base.json';

/**
 * Get the ECMAScript target as defined in the TypeScript config.
 *
 * @returns {string}
 */
export const TARGET = tsConfig.compilerOptions.target || 'esnext';
