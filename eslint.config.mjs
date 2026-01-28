// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores} from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig(
	globalIgnores(["dist"]),
	{
      files: ["**/*.{ts}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {
          project: "./tsconfig.json",
        },
      },
      extends: [
        eslint.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        eslintConfigPrettier,
      ],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
      }
});
