import defaults from './rollup-defaults';

var pkg = require('../package.json');

var config = {
    entry: 'build/es6/main.js',
    targets: [
        {
            dest: `dist/${pkg.name}.es6.js`,
            format: 'es'
        }
    ]
};

export default Object.assign({}, defaults, config);
