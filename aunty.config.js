const path = require('path');

const ADDITIONAL_ENTRY_POINTS = ['explorer'];

module.exports = {
  webpack: config => {
    ADDITIONAL_ENTRY_POINTS.forEach(name => {
      config.entry[name] = [config.entry.index[0].replace('index', `${name}`)];
    });

    config.resolve.alias = {
      react: path.resolve('./node_modules/react')
    };

    config.module.rules.push({
      test: /\.[tc]sv$/,
      loader: 'csv-loader',
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      }
    });

    return config;
  },

  deploy: [
    {
      to: '/www/res/sites/news-projects/<name>/<id>'
    },
    config => {
      fs.writeFileSync(
        path.join(__dirname, 'redirect', 'index.js'),
        `window.location = String(window.location).replace('/latest/', '/${config.id}/')`
      );

      return {
        ...config,
        from: 'redirect',
        to: '/www/res/sites/news-projects/<name>/latest'
      };
    }
  ]
};
