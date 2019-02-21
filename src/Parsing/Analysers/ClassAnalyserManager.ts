import ClassAnalyser from '../../Contracts/Parsing/ClassAnalyser';
import ES5ClassAnalyser from './es5/ClassAnalyser';
import ESNextClassAnalyser from './esnext/ClassAnalyser';
import Manager from '../../Support/Manager';
import {DriverCreators} from '../../types/support';
import {TARGET} from '../../constants/.';

class ClassAnalyserManager extends Manager {

    /**
     * The AST representing the parsed class.
     *
     * @var {Object}
     */
    private _ast: any;

    /**
     * Create a new class analyser manager instance.
     *
     * @constructor
     * @param {*} ast
     */
    public constructor(ast: any) {
        super();

        this._ast = ast;
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
     * @returns {ClassAnalyser}
     */
    protected _createDriver<ClassAnalyser>(driver: string): ClassAnalyser {
        return this._handleDriverCreation(driver, this._getDriverCreators());
    }

    /**
     * Get all the driver creators.
     *
     * @returns {DriverCreators}
     */
    protected _getDriverCreators(): DriverCreators {
        return {
            es5: this._createES5ClassAnalyser.bind(this),
            esnext: this._createESNextClassAnalyser.bind(this),
        };
    }

    /**
     * Create an instance of the es5 analyser.
     *
     * @returns {ES5ClassAnalyser}
     */
    private _createES5ClassAnalyser(): ClassAnalyser {
        return new ES5ClassAnalyser(this._ast);
    }

    /**
     * Create an instance of the es next analyser.
     *
     * @returns {ESNextClassAnalyser}
     */
    private _createESNextClassAnalyser(): ClassAnalyser {
        return new ESNextClassAnalyser(this._ast);
    }

}

export default ClassAnalyserManager;
