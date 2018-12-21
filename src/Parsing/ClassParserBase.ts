import ParserManager from './ParserManager';

abstract class ClassParserBase {

    /**
     *  The parser manager instance.
     *
     * @var {ParserManager}
     */
    private static _manager: ParserManager = new ParserManager;

    /**
     * The ESTree-compatible abstract syntax tree representing the class.
     *
     * @var {Object}
     */
    protected _ast: any;

    /**
     * The class that is to be parsed.
     *
     * @var {mixed}
     */
    protected _target: any;

    /**
     * Create a new class parser instance.
     *
     * @param {mixed} target
     */
    public constructor(target: any) {
        this._target = target;
        this._ast = ClassParserBase._manager.ast(target);
    }

}

export default ClassParserBase;
