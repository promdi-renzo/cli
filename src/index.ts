#! /usr/bin/env node

import * as program from "commander";
import * as path from "path";
import { create } from "./lib/create";

const NPM = path.join(__dirname, "package.json");

import(NPM)
  .then(runCLI)
  .catch(error => console.log(error));

function runCLI(npm: any) {
  program.version(npm.version).description(npm.description);

  create();

  program.parse(process.argv);
}
