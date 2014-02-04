#!/usr/bin/env node

'use strict';

process.title = 'multiverse';

var CLI = require('../dist/server/cli');

CLI.start();
