import ES5ClassAnalyser from './es5/ClassAnalyser';
import ESNextClassAnalyser from './esnext/ClassAnalyser';
import IClassAnalyser from '../../Contracts/Parsing/IClassAnalyser';
import IParser from '../../Contracts/Parsing/IParser';
import Manager from '../../Support/Manager';
import ParserManager from '../ParserManager';
import {TARGET} from '../../Constants/.';

class ClassAnalyserManager extends Manager {

    /**
     * The AST representing the parsed class.
     *
     * @var {Object}
     */
    private _ast: any;

    /**
     * The class definition.
     *
     * @var {*}
     */
    private _target: any;

    /**
     * Create a new class analyser manager instance.
     *
     * @param {*} ast
     * @param {*} target
     */
    public constructor(ast: any, target: any) {
        super();

        this._ast = ast;
        this._target = target;
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
