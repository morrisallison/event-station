import sourcemaps from 'rollup-plugin-sourcemaps';

var banner = require('./banner');
var pkg = require('../package.json');

export default {
    banner: banner,
    moduleId: pkg.name,
    moduleName: pkg._rollup.moduleName,
    plugins: [
        sourcemaps()
    ],
};