import {Container, InterfaceFactory, injectable} from '../../dist/container';

const IContract = InterfaceFactory.make('IContract');

// eslint-disable-next-line typescript/no-empty-interface
interface IContract {
    //
}

@injectable()
class A {

    private _impl: IContract;

    public constructor(@IContract impl: IContract) {
        this._impl = impl;
    }

    public get impl(): IContract {
        return this._impl;
    }

}

class B implements IContract {}

const container = new Container;

container.bind(IContract.key, B);
const a = container.make(A); // a.impl --> B {}
