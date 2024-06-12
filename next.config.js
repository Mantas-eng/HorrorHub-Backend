module.exports = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.alias['styles'] = false;
        config.resolve.alias['app'] = false;
      }
      
      return config;
    },
  };