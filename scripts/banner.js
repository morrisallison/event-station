var meta = require('../package');

var year = new Date().getFullYear();
var banner = `/*
 * ${meta.name} v${meta.version}
 * Copyright (c) ${year} ${meta.author}
 * Released under the MIT/Expat license
 * @preserve
 */`;

module.exports = banner;
