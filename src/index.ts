#! /usr/bin/env node

import * as program from "commander";
import * as path from "path";
import * as shell from "shelljs";

// const packageJSON = path.resolve(process.cwd(), "package.json");
const mainJSON = path.join(__dirname, "../package.json");

import(mainJSON)
  .then(runCLI)
  .catch(error => console.log(error));

function runCLI(npm: any) {
  program.version(npm.version).description(npm.description);

  create();

  program.parse(process.argv);
}

function create() {
  program
    .command("new <directory>")
    .description("Create a MayaJS project")
    .action((dir: any) => {
      // Clone git repo for sample template
      const sample = `git clone https://github.com/mayajs/sample.git ${dir}`;
      if (shell.exec(sample).code !== 0) {
        shell.echo("Error: Git clone failed");
        shell.exit(1);
      }
      // Update sample templates package.json
    });
}
