import 'reflect-metadata';

import {Container, InterfaceFactory, injectable} from '../../dist/service-container';

const Contract = InterfaceFactory.make('Contract');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Contract {
    //
}

@injectable()
class A {

    private _impl: Contract;

    public constructor(@Contract impl: Contract) {
        this._impl = impl;
    }

    public get impl(): Contract {
        return this._impl;
    }

}

class B implements Contract {}

const container = new Container;

container.bind(Contract.key, B);
const a = container.make(A); // a.impl --> B {}
