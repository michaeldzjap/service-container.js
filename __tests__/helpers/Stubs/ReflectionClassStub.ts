import injectable from '@src/Support/injectable';
import {ReflectionClassContractStub} from '@helpers/Contracts/ReflectionClassContractStub';

export class DependencyStub {}

@injectable()
class ReflectionClassStub {

    private _dependency: DependencyStub;
    private _name: string;
    private _impl: ReflectionClassContractStub;

    public constructor(stub: DependencyStub, name: string = 'Riley Martin',
        @ReflectionClassContractStub impl: ReflectionClassContractStub) {
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
