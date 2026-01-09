import baseConfig, { restrictEnvAccess } from "@portfolio/eslint-config/base";
import nextjsConfig from "@portfolio/eslint-config/nextjs";
import reactConfig from "@portfolio/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
