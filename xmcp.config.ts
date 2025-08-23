import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  webpack: (config) => {
    // Exclude native modules from bundling
    config.externals = config.externals || {};
    if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
      config.externals['@resvg/resvg-js'] = 'commonjs @resvg/resvg-js';
      config.externals['@resvg/resvg-js-darwin-arm64'] = 'commonjs @resvg/resvg-js-darwin-arm64';
      config.externals['fontkit'] = 'commonjs fontkit';
    }
    
    // Add rule to handle font files
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    
    // Add loader for font files
    config.module.rules.push({
      test: /\.(ttf|otf|woff|woff2)$/,
      type: 'asset/inline', // This will inline the font as base64
    });
    
    return config;
  },
};

export default config;
