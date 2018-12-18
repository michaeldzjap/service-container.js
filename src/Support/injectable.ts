import InjectableService from './InjectableService';

export default (): Function => (target: any, propertyName?: string): void => {
    InjectableService.defineMetadata(target, propertyName);

    return target;
};
