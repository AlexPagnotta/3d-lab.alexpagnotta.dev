module.exports = {
  root: true,
  extends: ["eslint-config-react-alexpagnotta"],
  rules: {
    // Conflicts with rect-three-fiber
    "react/no-unknown-property": "off",
  },
  overrides: [
    {
      files: ["**/*.d.ts", "**/*.config.?(*.){js,ts}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
