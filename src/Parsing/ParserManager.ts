import CherowParser from './Parsers/CherowParser';
import IParser from '../Contracts/Parsing/IParser';
import Manager from '../Support/Manager';

export enum Driver {
    CHEROW = 'cherow'
}

class ParserManager extends Manager {

    /**
     * Get the ESTree-compatible AST.
     *
     * @param {mixed} target
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
        return Driver.CHEROW;
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
            {[Driver.CHEROW]: this._createCherowParser.bind(this)}
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
