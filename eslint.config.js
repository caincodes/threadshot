import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist", ".astro", ".vercel", "node_modules"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "id-length": [
        "error",
        { min: 2, exceptions: ["_", "a", "b", "i", "j", "x", "y"] },
      ],
    },
  }
);
