import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import svelte from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist", ".astro", ".vercel", "node_modules"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  svelte.configs.recommended,
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      "no-undef": "off", // TypeScript already reports undefined names
      eqeqeq: ["error", "always", { null: "ignore" }],
      "id-length": [
        "error",
        { min: 2, exceptions: ["_", "a", "b", "i", "j", "x", "y"] },
      ],
    },
  }
);
