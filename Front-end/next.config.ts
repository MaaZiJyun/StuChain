import type { NextConfig } from "next";
const fs = require('fs');
const path = require('path');

const nextConfig: NextConfig = {
  /* config options here */
  webpackDevMiddleware: (config: any) => {
    // Enable HTTPS in development
    config.devMiddleware = {
      publicPath: '/',
      https: {
        key: fs.readFileSync(path.join(__dirname, './ssl/key.pem')),
        cert: fs.readFileSync(path.join(__dirname, './ssl/cert.pem')),
      },
    };
    return config;
  },
};

export default nextConfig;
