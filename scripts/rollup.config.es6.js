import sourcemaps from 'rollup-plugin-sourcemaps';

var banner = require('./banner');

export default {
    banner: banner,
    entry: 'build/es6/main.js',
    moduleId: 'event-station',
    moduleName: 'EventStation',
    plugins: [
        sourcemaps()
    ],
    targets: [
        {
            dest: 'dist/event-station.es6.js',
            format: 'es'
        }
    ]
};
