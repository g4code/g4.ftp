#!/usr/bin/env node

var commander   = require("commander"),
    ftp         = require("../src/ftp"),
    packageData = require(__dirname + "/../package.json");

commander.version(packageData.version)
    .usage("[options]")
    .option('-e, --env <n>', 'environment variable')
    .option('-c, --config <n>', 'config')
    .parse(process.argv);

ftp.env = commander.env;
ftp.configPath = commander.config;
ftp.run();