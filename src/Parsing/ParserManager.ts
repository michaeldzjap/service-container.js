import CherowParser from './Parsers/CherowParser';
import Manager from '../Support/Manager';
import Parser from '../Contracts/Parsing/Parser';
import {DEFAULT_DRIVER, DRIVERS} from '../constants/parser';
import {DriverCreators} from '../types/support';

class ParserManager extends Manager {

    /**
     * Get the ESTree-compatible AST.
     *
     * @param {*} target
     * @returns {Object}
     */
    public ast(target: any): any {
        return this.driver().ast(target);
    }

    /**
     * Get the default driver name.
     *
     * @returns {string}
     */
    public getDefaultDriver(): string {
        return DEFAULT_DRIVER;
    }

    /**
     * Create a new driver insance.
     *
     * @param {string} driver
     * @returns {Parser}
     */
    protected _createDriver<Parser>(driver: string): Parser {
        return super._handleDriverCreation(driver, this._getDriverCreators());
    }

    /**
     * Get all the driver creators.
     *
     * @returns {DriverCreators}
     */
    protected _getDriverCreators(): DriverCreators {
        return {
            [DRIVERS.CHEROW]: this._createCherowParser.bind(this),
        };
    }

    /**
     * Create an instance of the cherow parser.
     *
     * @returns {CherowParser}
     */
    private _createCherowParser(): Parser {
        const options = {next: true, module: true, experimental: true};

        return new CherowParser(options);
    }

}

export default ParserManager;
