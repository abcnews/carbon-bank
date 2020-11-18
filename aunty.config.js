const { join, resolve } = require('path');
const fs = require('fs');
const glob = require('glob');

const ADDITIONAL_ENTRY_POINTS = ['explorer'];

module.exports = {
  webpack: config => {
    ADDITIONAL_ENTRY_POINTS.forEach(name => {
      config.entry[name] = [config.entry.index[0].replace('index', `${name}`)];
    });

    const rules = config.module.rules;
    const scriptsRule = rules.find(x => x.__hint__ === 'scripts');
    glob
      .sync('node_modules/d3-*', { cwd: __dirname })
      .forEach(pth => scriptsRule.include.push(resolve(__dirname, pth)));
    scriptsRule.include.push(resolve(__dirname, 'node_modules/nanoid'));
    config.resolve.alias = {
      react: resolve('./node_modules/react')
    };

    return config;
  },

  deploy: [
    {
      to: '/www/res/sites/news-projects/<name>/<id>'
    },
    config => {
      fs.writeFileSync(
        join(__dirname, 'redirect', 'index.js'),
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
