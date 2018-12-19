import {Container, injectable} from '../../dist/container';

class B {}

@injectable()
class A {

    private _b: B;

    public constructor(b: B) {
        this._b = b;
    }

}

const container = new Container;

container.bind(A);
const a = container.make(A);
