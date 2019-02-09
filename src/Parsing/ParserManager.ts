import CherowParser from './Parsers/CherowParser';
import IParser from '../Contracts/Parsing/IParser';
import Manager from '../Support/Manager';
import {DEFAULT_DRIVER, DRIVERS} from '../constants/parser';

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
     * @returns {IParser}
     */
    protected _createDriver(driver: string): IParser {
        return super._handleDriverCreation(
            driver,
            {[DRIVERS.CHEROW]: this._createCherowParser.bind(this)}
        );
    }

    /**
     * Create an instance of the cherow parser.
     *
     * @returns {CherowParser}
     */
    private _createCherowParser(): IParser {
        const options = {next: true, module: true, experimental: true};

        return new CherowParser(options);
    }

}

export default ParserManager;
