module.exports = {
    rootDir: "../",
    "transform": {
        ".ts": "ts-jest"
    },
    "testEnvironment": "node",
    "testRegex": "/__tests__/.*.spec.(ts|js)$",
    "moduleFileExtensions": [
        "js",
        "ts"
    ],
    "coveragePathIgnorePatterns": [
        "/node_modules/",
        "/__tests__/",
        "/dist/"
    ]
};
