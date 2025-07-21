const pkg = require("../package");
const year = new Date().getFullYear();

console.log(`/*
 * ${pkg.name} v${pkg.version}
 * Copyright (c) 2015-${year} ${pkg.author}. All rights reserved.
 * Released under the ${pkg.license} license
 * @preserve
 */\n`);
