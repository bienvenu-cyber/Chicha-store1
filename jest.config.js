export default {
    testEnvironment: 'node',
    transform: {
        '^.+\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/(?!express)/'
    ],
    moduleNameMapper: {
        '^(\.{1,2}/.*)\.js$': '$1'
    },
    testRegex: '(/__tests__/.*|(\.|/)(test|spec))\.js$',
    moduleFileExtensions: ['js', 'json', 'node']
};