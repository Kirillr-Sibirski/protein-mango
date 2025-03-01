import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three/examples/jsm/loaders/GLTFLoader': path.resolve(__dirname, 'node_modules/three/examples/jsm/loaders/GLTFLoader.js'),
        o1js: path.resolve(__dirname, 'node_modules/o1js/dist/web/index.js'),
        three: path.resolve(__dirname, 'node_modules/three/build/three.module.js')
      };
    }
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // To enable o1js for the web, we must set the COOP and COEP headers.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;