class FailStub {}

class ExpressionCollectorStub {

    public simpleArrayExpression(arr = [1, 2, 3]): void {
        //
    }

    public nestedArrayExpression(arr = [[[1]], [[1, 2]], [[1, 2, 3]]]): void {
        //
    }

    public mixedSimpleArrayExpression(arr = [1, '2', {a: 1, b: 2, c: 3}]): void {
        //
    }

    public mixedNestedArrayExpression(arr = [[[1, '2', {a: 1, b: 2, c: 3}]]]): void {
        //
    }

    public failingArrayExpression(arr = [new FailStub]): void {
        //
    }

    public simpleObjectExpression(obj = {a: 1, b: 2, c: 3}): void {
        //
    }

    public nestedObjectExpression(obj = {a: {b: {c: 1}}, d: {e: [1, 2, 3]}, f: [[1, 2, 3]]}): void {
        //
    }

    public failingObjectExpression(obj = {a: new FailStub}): void {
        //
    }

}

export default ExpressionCollectorStub;
