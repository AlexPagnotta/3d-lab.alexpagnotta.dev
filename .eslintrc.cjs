module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "no-var": "error",
    "prefer-const": "error",
    "spaced-comment": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],

    "react/no-unescaped-entities": "off",
    "react/self-closing-comp": "error",
    "react/no-unknown-property": "warn",

    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        ignoreRestSiblings: true,
        args: "none",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],

    "import/no-default-export": "warn",
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: ["builtin", "external", "parent", "sibling", "index"],
        pathGroups: [
          {
            pattern: "~/**",
            group: "internal",
          },
          {
            pattern: "/**",
            group: "internal",
            position: "before",
          },
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
