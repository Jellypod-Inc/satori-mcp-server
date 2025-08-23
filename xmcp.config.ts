import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  webpack: (config) => {
    // Exclude native modules from bundling
    config.externals = config.externals || {};
    if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
      config.externals['@resvg/resvg-js'] = 'commonjs @resvg/resvg-js';
      config.externals['@resvg/resvg-js-darwin-arm64'] = 'commonjs @resvg/resvg-js-darwin-arm64';
    }
    
    return config;
  },
};

export default config;
