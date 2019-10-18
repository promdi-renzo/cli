#! /usr/bin/env node

import * as program from "commander";
import * as path from "path";

// TASKS
import { createProject } from "./lib/task";

const NPM = path.join(__dirname, "package.json");

import(NPM)
  .then(runCLI)
  .catch(error => console.log(error));

function runCLI(npm: any) {
  program
    .version(npm.version)
    .option("new <directory>, n <directory>", "Creates a new mayajs project based on the directory.")
    .description(npm.description);

  program
    .command("new <directory>")
    .alias("n")
    .description("Create a MayaJS project")
    .action(createProject);

  program.parse(process.argv);
}
