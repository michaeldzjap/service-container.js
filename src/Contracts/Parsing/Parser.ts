interface Parser {

    /**
     * Parse the given source.
     *
     * @param {*} target
     * @returns {Object}
     */
    ast(target: any): any;

}

export default Parser;
