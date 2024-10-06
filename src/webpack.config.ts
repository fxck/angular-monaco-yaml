/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as webpack from 'webpack';

export default (config: webpack.Configuration) => {
  config.entry = {
    ...(config.entry as any),
    'yaml.worker': 'monaco-yaml/yaml.worker.js'
  };

  // Modify the output configuration for yaml.worker.js
  const originalFilename = config.output!.filename;
  config.output!.filename = (pathData: webpack.PathData) => {
    if (pathData.chunk?.name === 'yaml.worker') {
      return 'monaco-yaml/yaml.worker.js';
    }
    return typeof originalFilename === 'function'
      ? originalFilename(pathData)
      : originalFilename || '[name].js';
  };

  return config;
}
