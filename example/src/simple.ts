import {Container} from '../../dist/container';

const container = new Container;

container.bind('foo', (): string => 'bar');
const result = container.make('foo'); // --> 'bar'
