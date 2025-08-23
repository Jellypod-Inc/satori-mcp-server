import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  webpack: (config) => {
    // Add TypeScript/TSX loader
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add rule for .tsx files
    config.module.rules.push({
      test: /\.tsx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            jsx: 'react'
          }
        }
      },
      exclude: /node_modules/,
    });
    
    // Add rule for .node files (native modules)
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });
    
    // Add resolve extensions
    config.resolve = config.resolve || {};
    config.resolve.extensions = config.resolve.extensions || [];
    if (!config.resolve.extensions.includes('.tsx')) {
      config.resolve.extensions.push('.tsx');
    }
    if (!config.resolve.extensions.includes('.ts')) {
      config.resolve.extensions.push('.ts');
    }
    
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
