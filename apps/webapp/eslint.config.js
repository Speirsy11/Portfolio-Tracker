import baseConfig, { restrictEnvAccess } from "@exchange/eslint-config/base";
import nextjsConfig from "@exchange/eslint-config/nextjs";
import reactConfig from "@exchange/eslint-config/react";

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
