module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { 
                    targets: { node: 'current' },
                    modules: 'commonjs' 
                }]
            ]
        }]
    },
    transformIgnorePatterns: [
        'node_modules/(?!mongoose)/'
    ],
    moduleFileExtensions: ['js', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    setupFiles: ['<rootDir>/tests/setupTests.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov']
};
