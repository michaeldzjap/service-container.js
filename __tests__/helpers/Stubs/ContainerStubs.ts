import injectable from '@src/Support/injectable';
import {IContainerContractStub} from '@helpers/Contracts/IContainerContractStub';

export class ContainerConcreteStub {}

export class ContainerImplementationStub implements IContainerContractStub {}

export class ContainerImplementationStubTwo implements IContainerContractStub {}

@injectable()
export class ContainerDependentStub {

    public impl: IContainerContractStub;

    public constructor(@IContainerContractStub impl: IContainerContractStub) {
        this.impl = impl;
    }

}

@injectable()
export class ContainerNestedDependentStub {

    public inner: ContainerDependentStub;

    public constructor(inner: ContainerDependentStub) {
        this.inner = inner;
    }

}

export class ContainerLazyExtendStub {

    public static initialized = false;

    public init(): void {
        ContainerLazyExtendStub.initialized = true;
    }

}

@injectable()
export class ContainerDefaultValueStub {

    public stub: ContainerConcreteStub;
    public dflt: string;

    public constructor(stub: ContainerConcreteStub, dflt: string = 'Riley Martin') {
        this.stub = stub;
        this.dflt = dflt;
    }

}

@injectable()
export class ContainerMixedPrimitiveStub {

    public first: any;
    public last: any;
    public stub: ContainerConcreteStub;

    public constructor(first: any, stub: ContainerConcreteStub, last: any) {
        this.stub = stub;
        this.last = last;
        this.first = first;
    }

}

export class ContainerTestCallStub {

    public work(...args: Array<any>): Array<any> {
        return args;
    }

    @injectable()
    public inject(stub: ContainerConcreteStub, dflt: string = 'Riley Martin'): [ContainerConcreteStub, string] {
        return [stub, dflt];
    }

    @injectable()
    public unresolvable(foo: unknown, bar: unknown): unknown[] {
        return [foo, bar];
    }

}

@injectable()
export class ContainerTestContextInjectOne {

    public impl: IContainerContractStub;

    public constructor(@IContainerContractStub impl: IContainerContractStub) {
        this.impl = impl;
    }

}

@injectable()
export class ContainerTestContextInjectTwo {

    public impl: IContainerContractStub;

    public constructor(@IContainerContractStub impl: IContainerContractStub) {
        this.impl = impl;
    }

}

@injectable()
export class ContainerTestContextInjectThree {

    public impl: IContainerContractStub;

    public constructor(@IContainerContractStub impl: IContainerContractStub) {
        this.impl = impl;
    }

}

export class ContainerStaticMethodStub {

    @injectable()
    public static inject(stub: ContainerConcreteStub, dflt: string = 'Riley Martin'): [ContainerConcreteStub, string] {
        return [stub, dflt];
    }

}

@injectable()
export class ContainerInjectVariableStub {

    public something: unknown;

    public constructor(concrete: ContainerConcreteStub, something: unknown) {
        this.something = something;
    }

}

@injectable()
export class ContainerInjectVariableStubWithInterfaceImplementation implements IContainerContractStub {

    public something: unknown;

    public constructor(concrete: ContainerConcreteStub, something: unknown) {
        this.something = something;
    }

}

export class ContainerTestContextInjectInstantiations implements IContainerContractStub {

    public static instantiations: number;

    public constructor() {
        ContainerTestContextInjectInstantiations.instantiations++;
    }

}
