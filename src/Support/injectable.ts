// import InjectableService from './InjectableService';
//
// export default (): Function => (target: any, propertyKey?: string | symbol): void => (
//     InjectableService.defineMetadata(target, propertyKey)
// );

export default (): Function => (): void => {};
