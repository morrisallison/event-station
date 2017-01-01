import defaults from './rollup-defaults';

var pkg = require('../package.json');

var config = {
    entry: 'build/es5/main.js',
    targets: [
        {
            dest: `dist/${pkg.name}.js`,
            format: 'umd'
        },
        {
            dest: `dist/${pkg.name}.jsnext.js`,
            format: 'es'
        },
    ]
};

export default Object.assign({}, defaults, config);
