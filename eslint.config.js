import js from "@eslint/js";
import node from "eslint-plugin-n";
import mocha from "eslint-plugin-mocha";
import imprt from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import prettier from "eslint-plugin-prettier/recommended";
import babel from "@babel/eslint-parser";

const testFiles = ["test/{,**}/*.?(c)js"];

export default [
  js.configs.recommended,
  node.configs["flat/recommended-script"],
  comments.recommended,
  unicorn.configs.recommended,
  imprt.flatConfigs.recommended,
  prettier,
  {
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      parser: babel,
    },
    rules: {
      "unicorn/prevent-abbreviations": 0,
      "unicorn/no-null": 0,
      "unicorn/no-nested-ternary": 0,
      "unicorn/no-useless-promise-resolve-reject": 0,
      "unicorn/no-anonymous-default-export": 0,
      "unicorn/import-style": 0,
      "unicorn/catch-error-name": ["error", { name: "e" }],
      "@eslint-community/eslint-comments/no-unused-disable": "error",
    },
  },
  {
    ...mocha.configs.recommended,
    files: testFiles,
  },
  {
    files: testFiles,
    rules: {
      "mocha/no-mocha-arrows": "off",
      "mocha/handle-done-callback": "off", // since we are using node:test the done function is in a different position
    },
  },
  {
    ignores: ["dist/", "coverage/", "node_modules/"],
  },
];
