// config-overrides.js
const { ProvidePlugin } = require("webpack");

module.exports = function (config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.m?[jt]sx?$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
        {
          test: /\.m?[jt]sx?$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    resolve: {
      ...config.resolve,
      alias: {
        process: "process/browser",
      },
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
