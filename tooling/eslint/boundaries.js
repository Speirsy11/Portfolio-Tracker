/// <reference types="./types.d.ts" />

import * as path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import boundariesPlugin from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(path.join(import.meta.dirname, "../../.gitignore")),
  { ignores: ["**/*.config.*"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      boundaries: boundariesPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    settings: {
      "boundaries/include": ["apps/*", "packages/**/*"],
      "boundaries/elements": [
        {
          type: "app",
          pattern: "apps/*",
        },
        {
          type: "composition",
          pattern: "packages/compositions/*",
        },
        {
          type: "feature",
          pattern: "packages/features/*",
        },
        {
          type: "shared",
          pattern: "packages/shared/*",
        },
      ],
    },
    // We need standard parsing for boundaries to work (it usually relies on import resolution)
    // but we won't extend recommended rules to keep output clean.
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: ["app", "composition"],
              allow: ["app", "composition", "feature", "shared"],
            },
            {
              from: ["feature"],
              allow: ["shared", "feature"],
            },
            {
              from: ["shared"],
              allow: ["shared"],
            },
          ],
        },
      ],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: "off" },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs", "*.cjs"],
        },
      },
    },
  },
);
