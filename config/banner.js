var pkg = require('../package');

var year = new Date().getFullYear();
var banner = `/*
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${year} ${pkg.author}
 * Released under the ${pkg.license} license
 * @preserve
 */`;

module.exports = banner;
