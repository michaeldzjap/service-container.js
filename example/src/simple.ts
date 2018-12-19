import {Container} from '../../dist/container';

const container = new Container;

container.bind('foo', (): string => 'bar');
const result = container.make('foo');

console.log(result); // eslint-disable-line no-console
