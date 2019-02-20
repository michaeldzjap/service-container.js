import {isUndefined} from './helpers';
import {DriverCreators} from '../types/support';

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
     * @param {(string|undefined)} driver
     * @returns {*}
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
     * Register a custom driver creator closure.
     *
     * @param {string} driver
     * @param {Function} callback
     * @returns {this}
     */
    public extend(driver: string, callback: Function): this {
        this._customCreators.set(driver, callback);

        return this;
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
     * @returns {*}
     */
    protected abstract _createDriver<T>(driver: string): T;

    /**
     * Get all the driver creators.
     *
     * @returns {DriverCreators}
     */
    protected abstract _getDriverCreators(): DriverCreators;

    /**
     * Handle actual driver creation.
     *
     * @param {string} driver
     * @param {DriverCreator} creators
     * @returns {*}
     *
     * @throws {Error}
     */
    protected _handleDriverCreation<T>(driver: string, creators: DriverCreators): T {
        if (this._customCreators.has(driver)) {
            return this._callCustomCreator<T>(driver);
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
     * @returns {*}
     */
    private _callCustomCreator<T>(driver: string): T {
        // @ts-ignore
        return this._customCreators.get(driver)();
    }

}

export default Manager;
