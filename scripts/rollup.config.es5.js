import sourcemaps from 'rollup-plugin-sourcemaps';

var banner = require('./banner');

export default {
    banner: banner,
    entry: 'build/es5/main.js',
    moduleId: 'event-station',
    moduleName: 'EventStation',
    plugins: [
        sourcemaps()
    ],
    targets: [
        {
            dest: 'dist/event-station.js',
            format: 'umd'
        },
        {
            dest: 'dist/event-station.jsnext.js',
            format: 'es'
        },
    ]
};
