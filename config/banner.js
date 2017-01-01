var pkg = require('../package');

var banner = `/*
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${pkg.author}. All rights reserved.
 * Released under the ${pkg.license} license
 * @preserve
 */`;

module.exports = banner;
