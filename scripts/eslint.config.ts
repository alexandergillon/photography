import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,

  {
    files: [ "**/*.{js,mjs,cjs,ts,mts,cts}" ],
    ignores: [ "src/types/groupBy.d.ts" ],
    plugins: { js },
    extends: [ "js/recommended" ],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        }
      ]
    }
  },

  {
    files: [ "**/*.json" ],
    plugins: { json },
    language: "json/json",
    extends: [ "json/recommended" ]
  },
]);
