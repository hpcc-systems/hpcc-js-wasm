import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ["**/__screenshots__/**"]
    },
    {
        files: [
            "**/*.{js,mjs,cjs,ts}"
        ]
    },
    {
        languageOptions: {
            globals: globals.browser
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "none",
                    "varsIgnorePattern": "^_"
                }
            ],
            "@typescript-eslint/no-namespace": "off",
        }
    }

];