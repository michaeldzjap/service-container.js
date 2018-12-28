import Container from './Container';
import {Identifier} from '../Support/types';

class ExtenderManager {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * The extension closures for services.
     *
     * @var {Map}
     */
    protected _extenders: Map<any, Function[]> = new Map;

    /**
     * Create a new class binding builder.
     *
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * "Extend" an abstract type in the container.
     *
     * @param {Identifier} abstract
     * @param {Function} closure
     * @returns {void}
     */
    public extend<T>(abstract: Identifier<T>, closure: Function): void {
        abstract = this._container.getAlias<T>(abstract);

        if (this._container.getInstances().has(abstract)) {
            this._container.getInstances().set(
                abstract,
                closure(this._container.getInstances().get(abstract), this)
            );

            this._container.rebound<T>(abstract);
        } else {
            this._extenders.has(abstract)
                ? this._extenders.get(abstract)!.push(closure)
                : this._extenders.set(abstract, [closure]);

            if (this._container.resolved<T>(abstract)) {
                this._container.rebound<T>(abstract);
            }
        }
    }

    /**
     * Remove all of the extender callbacks for a given type.
     *
     * @param {Identifier} abstract
     * @returns {void}
     */
    public forgetExtenders<T>(abstract: Identifier<T>): void {
        this._extenders.delete(this._container.getAlias(abstract));
    }

    /**
     * Get the extension closures for services.
     *
     * @returns {Map}
     */
    public getExtenders(): Map<any, Function[]> {
        return this._extenders;
    }

}

export default ExtenderManager;
