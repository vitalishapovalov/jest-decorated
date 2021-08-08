const defaultConfig = require("./jest.config.default");

module.exports = {
    ...defaultConfig,
    testRunner: "jest-jasmine2",
};
