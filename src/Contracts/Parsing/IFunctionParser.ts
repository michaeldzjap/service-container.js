import IConstructorParser from './IConstructorParser';
import ReturnDescriptor from '@src/Parsing/Descriptors/ReturnDescriptor';

interface IFunctionParser extends IConstructorParser {

    /**
     * Check if the function has a return value.
     *
     * @returns {boolean}
     */
    hasReturnValue(): boolean;

    /**
     * Get the function return value and type.
     *
     * @returns {ReturnDescriptor|undefined}
     */
    getReturnValue(): ReturnDescriptor<any> | undefined;

}

export default IFunctionParser;
