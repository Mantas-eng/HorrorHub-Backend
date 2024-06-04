module.exports = {
    webpack: (config, { isServer }) => {
      // Ignore styles and app directories
      if (!isServer) {
        config.resolve.alias['styles'] = false;
        config.resolve.alias['app'] = false;
      }
      
      return config;
    },
  };