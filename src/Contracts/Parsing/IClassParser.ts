import IConstructorParser from './IConstructorParser';

interface IClassParser {

    /**
     * Determine if the class has a constructor.
     *
     * @returns {boolean}
     */
    hasConstructor(): boolean;

    /**
     * Get class constructor (if there is one).
     *
     * @returns {?IConstructorParser}
     */
    getConstructor(): IConstructorParser | undefined;

}

export default IClassParser;
