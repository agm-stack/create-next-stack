const tailwindAtRules = [
  "apply",
  "config",
  "custom-variant",
  "plugin",
  "reference",
  "source",
  "theme",
  "utility",
  "variant",
];

export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: tailwindAtRules,
      },
    ],
    "at-rule-prelude-no-invalid": null,
    "hue-degree-notation": null,
    "import-notation": "string",
    "lightness-notation": null,
  },
};
