import ParsingError from './Parsers/ParsingError';

class ExpressionCollector {

    /**
     * Recursively collect all the elements of an array expression structure.
     *
     * @param {Object} expr
     * @returns {Array}
     */
    public static collectElements(expr: any): any[] {
        return expr.elements.reduce((acc: any[], element: any): any[] => {
            switch (element.type) {
                case 'ArrayExpression':
                    acc.push(ExpressionCollector.collectElements(element));
                    break;
                case 'ObjectExpression':
                    acc.push(ExpressionCollector.collectProperties(element));
                    break;
                case 'Literal':
                    acc.push(element.value);
                    break;
                default:
                    ExpressionCollector._unresolvableExpression();
            }

            return acc;
        }, []);
    }

    /**
     * Recursively collect all the properties of an object expression structure.
     *
     * @param {Object} expr
     * @returns {Object}
     */
    public static collectProperties(expr: any): object {
        return expr.properties.reduce((acc: object, property: any): object => {
            const key = property.key.name;

            switch (property.value.type) {
                case 'ArrayExpression':
                    acc[key] = ExpressionCollector.collectElements(property.value);
                    break;
                case 'ObjectExpression':
                    acc[key] = ExpressionCollector.collectProperties(property.value);
                    break;
                case 'Literal':
                    acc[key] = property.value.value;
                    break;
                default:
                    ExpressionCollector._unresolvableExpression();
            }

            return acc;
        }, {});
    }

    /**
     * Throw an error if we encounter an expression type that we don't know how
     * to handle (yet).
     *
     * @returns {void}
     *
     * @throws {Error}
     */
    private static _unresolvableExpression(): void {
        throw new ParsingError('ESTree expression cannot be resolved.');
    }

}

export default ExpressionCollector;
