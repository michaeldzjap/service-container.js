import ES5ClassAnalyser from './es5/ClassAnalyser';
import ESNextClassAnalyser from './esnext/ClassAnalyser';
import IClassAnalyser from '../../Contracts/Parsing/IClassAnalyser';
import IParser from '../../Contracts/Parsing/IParser';
import Manager from '../../Support/Manager';
import ParserManager from '../ParserManager';
import {TARGET} from '../../Constants/.';

class ClassAnalyserManager extends Manager {

    /**
     * The parser instance.
     *
     * @var {IParser}
     */
    private _parser: IParser;

    /**
     * The class definition.
     *
     * @var {*}
     */
    private _target: any;

    /**
     * The AST representing the parsed class.
     *
     * @var {Object}
     */
    private _ast: any;

    /**
     * Create a new class analyser manager instance.
     *
     * @param {*} target
     */
    public constructor(target: any) {
        super();

        this._target = target;
        this._parser = (new ParserManager).driver();
        this._ast = this._parser.ast(this._target).body[0];
    }

    /**
     * Get the default driver name.
     *
     * @returns {string}
     */
    public getDefaultDriver(): string {
        return TARGET;
    }

    /**
     * Create a new driver insance.
     *
     * @param {string} driver
     * @returns {IClassAnalyser}
     */
    protected _createDriver(driver: string): IClassAnalyser {
        return super._handleDriverCreation(
            driver,
            {
                es5: this._createES5ClassAnalyser.bind(this),
                esnext: this._createESNextClassAnalyser.bind(this)
            }
        );
    }

    /**
     * Create an instance of the es5 analyser.
     *
     * @returns {ES5ClassAnalyser}
     */
    private _createES5ClassAnalyser(): IClassAnalyser {
        return new ES5ClassAnalyser(this._ast, this._target);
    }

    /**
     * Create an instance of the es next analyser.
     *
     * @returns {ESNextClassAnalyser}
     */
    private _createESNextClassAnalyser(): IClassAnalyser {
        return new ESNextClassAnalyser(this._ast, this._target);
    }

}

export default ClassAnalyserManager;
