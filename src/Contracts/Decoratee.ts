interface Decoratee {

    /**
     * The decorator target (constructor or instance).
     *
     * @var {*}
     */
    target: any;

    /**
     * A (static) property of the target.
     *
     * @var {(string|symbol)}
     */
    propertyKey?: string | symbol;

    /**
     * A property descriptor instance.
     *
     * @var {?(PropertyDescriptor|undefined)}
     */
    attributes?: PropertyDescriptor | null;

}

export default Decoratee;
