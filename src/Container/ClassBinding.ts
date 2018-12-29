import Container from './Container';
import IClassBinding from '../Contracts/Container/IClassBinding';
import {equals} from '../Support/helpers';
import {Identifier, Instantiable} from '../Support/types';

class ClassBinding implements IClassBinding {

    /**
     * The underlying container instance.
     *
     * @var {Container}
     */
    protected _container: Container;

    /**
     * Create a new class binding builder.
     *
     * @param {Container} container
     */
    public constructor(container: Container) {
        this._container = container;
    }

    /**
     * Get the Closure to be used when building a type.
     *
     * @param {Identifier} abstract
     * @param {Identifier} concrete
     * @returns {Function}
     */
    public getClosure<U, V>(abstract: Identifier<U>, concrete: Instantiable<V>): Function {
        return (container: Container, parameters: Map<string, any> = new Map): unknown => {
            if (equals(abstract, concrete)) {
                return this._container.build<V>(concrete);
            }

            return this._container.make(concrete, parameters);
        };
    }

}

export default ClassBinding;
