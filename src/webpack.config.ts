/* eslint-disable @typescript-eslint/no-explicit-any */
import * as webpack from 'webpack';

export default (config: webpack.Configuration) => {
  // Remove the existing css loader rule
  const cssRuleIdx = config?.module?.rules?.findIndex((rule: any) => rule.test?.toString().includes(':css'));
  if (cssRuleIdx !== -1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config?.module?.rules?.splice(cssRuleIdx!, 1);
  }
  config?.module?.rules?.push(
    {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    },
    // webpack 5
    {
      test: /\.ttf$/,
      type: 'asset/resource'
    }
  );
  return config;
}
