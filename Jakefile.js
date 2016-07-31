'strict mode';

/* global complete */
/* global desc */
/* global task */

require('coffee-script/register');
require('blanket');

const fs    = require('fs');
const path  = require('path');
const cp    = require('child_process');
const Mocha = require('mocha');

const testsPath   = './tests';
const libPath     = './lib';
const distPath    = './dist';
const reportsPath = './reports';
const modulesPath = './node_modules';

const testsDir   = path.resolve('.', testsPath);
const libDir     = path.resolve('.', libPath);
const distDir    = path.resolve('.', distPath);
const reportsDir = path.resolve('.', reportsPath);

const tscFile      = path.resolve('.', modulesPath, '.bin/tsc');
const uglifyjsFile = path.resolve('.', modulesPath, '.bin/uglifyjs');
const mochaFile    = path.resolve('.', modulesPath, '.bin/mocha');

/**
 * Override the default module loader
 */
const moduleClass = require('module');
const nativeRequire = moduleClass.prototype.require;

// Determines whether the distributed version of EventStation is imported
var importDist = false;

moduleClass.prototype.require = function (id) {

    if (id !== 'event-station') {
        return nativeRequire.apply(this, arguments);
    }

    var file;

    if (importDist) {
        file = path.resolve(distPath + '/event-station.min.js');
    } else {
        file = path.resolve(libDir + '/EventStation.js');
    }

    return nativeRequire.apply(this, [file]);
};

const mochaReporters = {
    html: 'html-cov',
    json: 'json-cov',
    lcov: 'mocha-lcov-reporter',
};

// --------------------------------------------------------
// --------------------------------------------------------
// --------------------------------------------------------

desc('Cleans, compile, build, test, and cover.');
task('default', ['clean', 'compile', 'build', 'test', 'cover']);

desc('Compiles the library.');
task('compile', function () {
    cp.execSync(tscFile);
    console.log('Compilation complete.');
});

desc('Builds distribution files.');
task('build', function () {
    buildDist();
    console.log('Build complete.');
});

desc('Deletes all generated files.');
task('clean', ['clean:lib', 'clean:dist', 'clean:reports']);

namespace('clean', function () {
    desc('Deletes the library.');
    task('lib', function () {
        clean(libDir);
    });

    desc('Deletes distribution files.');
    task('dist', function () {
        clean(distDir);
    });

    desc('Deletes reports.');
    task('reports', function () {
        clean(reportsDir);
    });
});

desc('Generates coverage reports.');
task('cover', ['cover:html', 'cover:json', 'cover:lcov']);

namespace('cover', function () {
    desc('Generates a HTML coverage report.');
    task('html', function () {
        cover('html');
    });

    desc('Generates a JSON coverage report.');
    task('json', function () {
        cover('json');
    });

    desc('Generates a LCOV coverage report.');
    task('lcov', function () {
        cover('lcov');
    });
});

desc('Runs the test suite against the library module.');
task('test', { async: true }, runTests.bind({}, complete));

namespace('test', function () {
    desc('Runs the test suite against the distributed module.');
    task('dist', { async: true }, function () {
        importDist = true;
        runTests(function () {
            importDist = false;
            complete();
        });
    });
});

desc('Runs benchmark.');
task('benchmark', function () {
    require(path.resolve('.', 'benchmarks/event-callback.js'));
});

// --------------------------------------------------------
// --------------------------------------------------------
// --------------------------------------------------------

function clean(dir) {

    var fileNames = fs.readdirSync(dir);

    for (var i = 0, c = fileNames.length; i < c; i++) {

        var fileName = fileNames[i];

        // Skip files prefixed with a period
        if (fileName.indexOf('.') === 0) continue;

        var filePath = path.join(dir, fileName);

        fs.unlinkSync(filePath);
    }

    console.log('Directory cleaned: ' + dir);
}

function cover(type) {

    var cmd = [
        mochaFile,
        '--require', 'blanket',
        '--reporter', mochaReporters[type],
        '--compilers', 'coffee:coffee-script/register',
        '--recursive',
        testsPath,
        '>', path.resolve(reportsDir, 'coverage.' + type)
    ].join(' ')

    cp.execSync(cmd);

    console.log(type.toUpperCase() + ' Coverage report generated');
}

function buildDist() {

    var tscDistCmd = [
        tscFile,
        '--module', 'umd',
        '--outDir', distPath,
        '--declaration',
    ].join(' ');

    cp.execSync(tscDistCmd);

    const modulePath = path.resolve('.', distPath, 'EventStation.js');

    renovateUmd(modulePath);

    fs.renameSync(
        modulePath,
        path.resolve('.', distPath, 'event-station.js')
        );

    fs.renameSync(
        path.resolve('.', distPath, 'EventStation.d.ts'),
        path.resolve('.', distPath, 'event-station.d.ts')
        );

    var minifyCmd = [
        uglifyjsFile,
        '--screw-ie8',
        '--comments',
        '-c',
        '-m',
        '-o', distPath + '/event-station.min.js',
        '--source-map', distPath + '/event-station.min.js.map',
        '-p', 'relative',
        distPath + '/event-station.js',
    ].join(' ');

    cp.execSync(minifyCmd);
}

function runTests(callback) {

    var mocha = new Mocha({
        reporter: 'spec',
    });

    var tests = getTests(testsDir);

    for (var i = 0, c = tests.length; i < c; i++) {
        mocha.addFile(tests[i]);
    }

    mocha.run(function (failures) {

        process.on('exit', function () {
            process.exit(failures);
        });

        if (callback) callback();
    });
}

function getTests(dir) {

    var tests = [];

    var fileNames = fs.readdirSync(dir);

    for (var i = 0, c = fileNames.length; i < c; i++) {

        var filePath = path.join(dir, fileNames[i]);
        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            tests = tests.concat(getTests(filePath));
        }

        if (stat.isFile() && ! filePath.endsWith('.opts')) {
            tests.push(filePath);
        }
    }

    return tests;
}

const renovateSearch = '})(["require", "exports"], function (require, exports) {';

const renovateReplace = `    else if (typeof self === "object") {
        self.EventStation = factory();
    }
})(["require", "exports"], function (require, exports) {
    "use strict";`;

function renovateUmd(modulePath) {

    const data = fs
        .readFileSync(modulePath)
        .toString()
        .split(renovateSearch)
        .join(renovateReplace);

    fs.writeFileSync(modulePath, data);
}