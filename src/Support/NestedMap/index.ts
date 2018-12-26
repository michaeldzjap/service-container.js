import ES5NestedMap from './ES5NestedMap';
import ESNextNestedMap from './ESNextNestedMap';
import {TARGET} from '../../Constants/.';

export default ((): any => {
    switch (TARGET) {
        case 'es5':
            return ES5NestedMap;
        case 'esnext':
            return ESNextNestedMap;
        default:
            throw new Error('Invalid ECMAScript version specified.');
    }
})();
