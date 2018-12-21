import {isUndefined} from './helpers';

abstract class Manager {

    /**
     * The registered custom driver creators.
     *
     * @var {Map}
     */
    protected _customCreators: Map<string, Function> = new Map;

    /**
     * The map with available driver instances.
     *
     * @var {Map}
     */
    protected _drivers: Map<string, any> = new Map;

    /**
     * Get the default driver name.
     *
     * @returns {string}
     */
    public abstract getDefaultDriver(): string;

    /**
     * Get the given driver instance.
     *
     * @param {?string} driver
     * @returns {IParser}
     *
     * @throws {Error}
     */
    public driver(driver?: string): any {
        driver = driver || this.getDefaultDriver();

        if (isUndefined(driver)) {
            throw new Error('Unable to resolve undefined driver.');
        }

        if (!this._drivers.has(driver)) {
            this._drivers.set(driver, this._createDriver(driver));
        }

        return this._drivers.get(driver);
    }

    /**
     * Get all of the created drivers.
     *
     * @returns {Map}
     */
    public getDrivers(): Map<string, any> {
        return this._drivers;
    }

    /**
     * Create a new driver instance.
     *
     * @param {string} driver
     * @returns {mixed}
     */
    protected abstract _createDriver(driver: string): any;

    /**
     * Handle actual driver creation.
     *
     * @param {string} driver
     * @param {Object} creators
     * @returns {mixed}
     *
     * @throws {Error}
     */
    protected _handleDriverCreation(driver: string, creators: object): any {
        if (this._customCreators.has(driver)) {
            return this._callCustomCreator(driver);
        }

        if (creators.hasOwnProperty(driver)) {
            return creators[driver]();
        }

        throw new Error(`Driver [${driver}] is not supported.`);
    }

    /**
     * Call a custom driver instance.
     *
     * @param {string} driver
     * @returns {mixed}
     */
    private _callCustomCreator(driver: string): any {
        return (this._customCreators.get(driver) as Function)();
    }


}

export default Manager;
