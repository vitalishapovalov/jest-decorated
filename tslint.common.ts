module.exports = {
    "extends": "tslint-config-airbnb",
    "rules": {
        "no-duplicate-imports": false,
        "max-line-length": [true, 160],
        "quotemark": [true, "double"],
        "ter-indent": [true, 4, { "SwitchCase": 1 }],
        "prefer-template": [false],
        "function-name": [true, {
            "method-regex": "^\\*?\\[?[a-z][\\w\\d\\.]*\\]?$",
            "private-method-regex": "^\\*?\\[?[a-zA-Z][\\w\\d\\.]*\\]?$",
            "protected-method-regex": "^\\*?\\[?[a-z][\\w\\d\\.]*\\]?$",
            "static-method-regex": "^\\*?\\[?[a-zA-Z][\\w\\d\\.]*\\]?$",
            "function-regex": "^\\*?\\[?[a-zA-Z][\\w\\d\\.]*\\]?$"
        }],
        "trailing-comma": [
            true,
            {
                "multiline": {
                    "objects": "always",
                    "arrays": "always",
                    "functions": "never",
                    "typeLiterals": "ignore"
                },
                "esSpecCompliant": true
            }
        ],
        "no-this-assignment": false
    }
};
