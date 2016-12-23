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

        var declaration = '\ndeclare module "event-station" {';
        var definition = buf.toString()
            .replace(/(}\n)?declare module "([^"]*)" {/g, '')
            .replace(/\n\s+import ([^"]+) from "([^"]+)";/g, '');
        var output = banner + declaration + definition;

        fs.writeFile(dest, output, function (err) {
            if (err) throw err;
        });
    });
});
