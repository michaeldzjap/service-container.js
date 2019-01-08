import Container from './Container';
import IExtender from '../Contracts/Container/IExtender';
import {Identifier} from '../Support/types';

class Extender implements IExtender {

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
     * @constructor
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

        if (this._container.getInstanceSharer().hasSharedInstance(abstract)) {
            this._container
                .getInstanceSharer()
                .addSharedInstance(
                    abstract,
                    closure(
                        this._container
                            .getInstanceSharer()
                            .getSharedInstance(abstract), this
                    )
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
     * Determine if the container contains the given extension closure.
     *
     * @param {Identifier} abstract
     * @returns {boolean}
     */
    public hasExtenders<T>(abstract: Identifier<T>): boolean {
        return this._extenders.has(abstract);
    }

    /**
     * Get the extension closure for services keyed by the given abstract name.
     *
     * @param {Identifier} abstract
     * @returns {(Function[]|undefined)}
     */
    public getExtenders<T>(abstract: Identifier<T>): Function[] | undefined {
        return this._extenders.get(abstract);
    }

}

export default Extender;
