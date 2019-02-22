module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@helpers/(.*)$': '<rootDir>/__tests__/helpers/$1',
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@base/(.*)$': '<rootDir>/$1'
    },
    moduleDirectories: [
        'node_modules',
        'src',
    ],
    setupFiles: [
        '<rootDir>/__tests__/setup.ts'
    ],
    testMatch: [
        '<rootDir>/__tests__/unit/Parsing/es5/*.[jt]s?(x)',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/__tests__/helpers/',
        '<rootDir>/__tests__/setup.ts',
    ],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.es5-test.json'
        }
    },
    collectCoverage: true
};
