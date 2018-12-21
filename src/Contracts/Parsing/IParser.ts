interface IParser {

    /**
     * Parse the given source.
     *
     * @param {any} target
     * @returns {Object}
     */
    ast(target: any): any;

}

export default IParser;
