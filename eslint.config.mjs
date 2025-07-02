// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.d.ts',
      'drizzle.config.*.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      
      // Strict unused variable and import rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off', // Use TypeScript version instead
      
      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',    // Node.js built-in modules
            'external',   // npm packages
            'internal',   // internal modules
            'parent',     // parent directory imports
            'sibling',    // same directory imports
            'index',      // index file imports
            'object',     // object imports
            'type',       // type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/no-unused-modules': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      
      // General code quality rules
      'no-console': 'warn', // Warn about console.log usage
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      'no-useless-constructor': 'error',
      'no-useless-return': 'error',
      'no-return-await': 'error',
      'require-await': 'off', // Use TypeScript version
    },
  },
  // NestJS-specific overrides
  {
    files: [
      '**/*.module.ts',
      '**/*.controller.ts',
      '**/*.service.ts',
      '**/*.guard.ts',
      '**/*.interceptor.ts',
      '**/*.filter.ts',
      '**/*.decorator.ts',
      '**/*.pipe.ts',
      '**/*.strategy.ts',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/require-await': 'error',
      'no-console': 'warn',
    },
  },
  // GraphQL-specific overrides
  {
    files: [
      '**/*.resolver.ts',
      '**/*.schema.ts',
      '**/*.type.ts',
      '**/*.input.ts',
      '**/*.enum.ts',
      '**/*.scalar.ts',
      '**/*.directive.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'warn',
    },
  },
  // Drizzle ORM-specific overrides
  {
    files: [
      '**/schemas/**/*.ts',
      '**/migrations/**/*.ts',
      '**/*.schema.ts',
      '**/*.migration.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
    },
  },
  // React Email template overrides
  {
    files: [
      '**/templates/**/*.tsx',
      '**/*.template.tsx',
      '**/*.email.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
      'import/order': 'off',
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    },
  },
  // Test-specific overrides
  {
    files: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/test/**/*.ts',
      '**/tests/**/*.ts',
      '**/__tests__/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/unbound-method': 'off', // Common pattern in Jest tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off', // Allow console in tests
      'import/order': 'off', // Relax import order for tests
    },
  },
  // Setup files specific overrides
  {
    files: [
      '**/test/setup/**/*.ts',
      '**/jest.setup.ts',
      '**/test-setup.ts',
    ],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'import/order': 'off',
    },
  },
  // Configuration files overrides
  {
    files: [
      '**/*.config.ts',
      '**/*.config.js',
      '**/nest-cli.json',
      '**/tsconfig*.json',
      '**/package.json',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
      'import/order': 'off',
    },
  },
  // Plugin-specific overrides
  {
    files: [
      '**/plugins/*.ts',
      '**/*.plugin.ts',
      '**/core/plugins/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
    },
  },
  // Service-specific overrides
  {
    files: [
      '**/services/*.ts',
      '**/*.service.ts',
      '**/infra/**/*.service.ts',
    ],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      'no-console': 'warn',
    },
  },
  // Worker and background job overrides
  {
    files: [
      '**/workers/*.ts',
      '**/*.worker.ts',
      '**/cron/*.ts',
      '**/*.cron.ts',
      '**/queue/*.ts',
      '**/*.queue.ts',
      '**/jobs/*.ts',
      '**/*.job.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-console': 'off',
    },
  },
  // Database and migration overrides
  {
    files: [
      '**/database/**/*.ts',
      '**/migrations/**/*.ts',
      '**/drizzle/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-console': 'off',
    },
  },
  // Email and notification overrides
  {
    files: [
      '**/email/**/*.ts',
      '**/notifications/**/*.ts',
      '**/mail/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-console': 'off',
    },
  },
  // Main application files
  {
    files: [
      'src/main.ts',
      'src/app.module.ts',
      'src/**/index.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-console': 'off',
    },
  },
);