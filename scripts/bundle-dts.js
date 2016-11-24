'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var banner = require('./banner');

var dest = path.resolve(__dirname, '../dist/event-station.d.ts');
var dist = path.resolve(__dirname, '../dist');
var src = path.resolve(__dirname, '../build/dts/main.d.ts');

mkdirp(dist, function () {
    fs.readFile(src, function (err, buf) {
        if (err) throw err;

        var output = banner + '\n' + buf.toString()
            .replace(/declare module "/g, 'declare module "__event-station#')
            .replace(/from "/g, 'from "__event-station#')
            .replace(/"__event-station#main"/g, '"event-station"');

        fs.writeFile(dest, output, function (err) {
            if (err) throw err;
        });
    });
});
