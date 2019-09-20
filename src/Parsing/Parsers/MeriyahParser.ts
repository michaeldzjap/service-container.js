import Parser from '../../Contracts/Parsing/Parser';
import {parse} from 'meriyah';

class MeriyahParser implements Parser {

    /**
     * The Meriyah parser options.
     *
     * @var {Object}
     */
    private _options: object;

    /**
     * Create a new Meriyah parser instance.
     *
     * @param {Object} options
     */
    public constructor(options: object) {
        this._options = options;
    }

    /**
     * Parse the given source.
     *
     * @param {*} target
     * @returns {Object}
     */
    public ast(target: any): any {
        return parse(target.toString(), this._options);
    }

}

export default MeriyahParser;
