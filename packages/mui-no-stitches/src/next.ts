import withLinaria from 'next-with-linaria';
import baseConfig, { StitchesPluginConfig } from './baseConfig';

interface NostitchesConfig {
  stitches: StitchesPluginConfig;
}

export default function withNoStitches({ stitches, ...rest }: NostitchesConfig) {
  return withLinaria({
    ...rest,
    linaria: {
      ...baseConfig,
      ...stitches,
    },
  });
}
