import IParser from '../../Contracts/Parsing/IParser';
import {parse} from 'cherow';

class CherowParser implements IParser {

    /**
     * The cherow parser options.
     *
     * @var {Object}
     */
    private _options: object;

    /**
     * Create a new cherow parser instance.
     *
     * @param {Object} options
     */
    public constructor(options: object) {
        this._options = options;
    }

    /**
     * Parse the given source.
     *
     * @param {mixed} target
     * @returns {Object}
     */
    public ast(target: any): any {
        return parse(target.toString(), this._options);
    }

}

export default CherowParser;
