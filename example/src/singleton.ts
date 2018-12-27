import {Container} from '../../dist/service-container';

class A {}

const container = new Container;

container.singleton(A);
const a1 = container.make(A);
const a2 = container.make(A); // a1 === a2 --> true
