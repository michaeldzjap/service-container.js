import injectable from '@src/Support/injectable';
import {IReflectionClassContractStub} from '@helpers/Contracts/IReflectionClassContractStub';

export class DependencyStub {}

@injectable()
class ReflectionClassStub {

    private _dependency: DependencyStub;
    private _name: string;
    private _impl: IReflectionClassContractStub;

    public constructor(stub: DependencyStub, name: string = 'Riley Martin',
        @IReflectionClassContractStub impl: IReflectionClassContractStub) {
        this._dependency = stub;
        this._name = name;
        this._impl = impl;
    }

    public static publicStaticMethod(): void {
        //
    }

    public publicMethod(): void {
        //
    }

    private _privateMethod(): void {
        //
    }

}

export default ReflectionClassStub;
