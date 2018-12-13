import {parseScript, Options} from 'cherow';

class ESTreeGenerator {

    /**
     * Get the ESTree instance.
     *
     * @param {string} source
     * @param {Options} options
     * @returns {Object}
     */
    public static generate(source: string, options?: Options): any {
        return parseScript(source, options);
    }

}

export default ESTreeGenerator;
