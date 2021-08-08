module.exports = {
    rootDir: "../",
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [
        "<rootDir>/src/__tests__/env.ts"
    ],
    testRegex: "/__tests__/.*.spec.(ts|js|tsx|jsx)$",
    moduleFileExtensions: [
        "js",
        "jsx",
        "ts",
        "tsx"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/",
        "/dist/"
    ]
};
