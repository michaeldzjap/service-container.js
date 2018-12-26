module.exports = {
    moduleFileExtensions: ['ts', 'tsx', 'js'],
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
        '<rootDir>/__tests__/unit/Parsing/esnext/*.+(ts|tsx)',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/__tests__/helpers/',
        '<rootDir>/__tests__/setup.ts',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.esnext-test.json'
        }
    }
};
