import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "no-trailing-spaces": ["error"],
      "eol-last": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
    },
  },

  {
    files: ["**/*.vue"],
    extends: [pluginVue.configs["flat/recommended"]],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      "vue/max-attributes-per-line": ["error", {
        "singleline": {
          "max": 5,
        },
        "multiline": {
          "max": 1,
        },
      }],
    },
  },

  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
