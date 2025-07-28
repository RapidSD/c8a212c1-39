export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      }
    ]
  },
  // WebContainer compatibility settings
  compiler: {
    // Remove React properties for better performance in containers
    reactRemoveProperties: true,
  },
  // Use webpack instead of turbopack for better compatibility
  webpack: (config) => {
    // Optimize for WebContainer environment
    config.optimization.minimize = false;
    return config;
  }
};
