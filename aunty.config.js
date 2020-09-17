module.exports = {
  webpack: {
    module: {
      rules: [
        {
          test: /\.[tc]sv$/,
          loader: 'csv-loader',
          options: {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true
          }
        }
      ]
    }
  }
};
