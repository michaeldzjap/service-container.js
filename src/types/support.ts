export interface DriverCreators {

    /**
     * A function that creates a specific driver.
     *
     * @var {Function}
     */
    [driver: string]: Function;

}
