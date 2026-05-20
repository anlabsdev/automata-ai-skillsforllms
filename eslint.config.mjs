import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  // Shared ignore patterns
  {
    ignores: [
      "**/dist/**",
      "**/dist-types/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.vite/**",
      "**/coverage/**",
      "**/.skills/**"
    ]
  },

  // Base JS rules
  eslint.configs.recommended,

  // TypeScript rules for source files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"]
  })),

  // Global config for all files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      // Relax rules that conflict with project style
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error"
    }
  },

  // Specific overrides for test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off"
    }
  },

  // Scripts (mjs files) – no TypeScript rules
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
);
