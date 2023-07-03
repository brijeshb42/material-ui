import linaria from '@linaria/vite';
import baseConfig, { StitchesPluginConfig } from './baseConfig';

const stitchesPlugin = (config?: StitchesPluginConfig) =>
  linaria({
    ...baseConfig,
    ...config,
  });

export default stitchesPlugin;
