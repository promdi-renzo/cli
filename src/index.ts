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
      gitClone(dir);
      installDependency();
      // Update sample templates package.json
    });
}

function gitClone(dir: string) {
  const sample = `git clone https://github.com/mayajs/sample.git ${dir}`;
  if (shell.exec(sample).code !== 0) {
    shell.echo("Error: Git clone failed");
    shell.exit(1);
  }
  shell.cd(dir);
}

function installDependency() {
  shell.echo("Installing dependencies");
  if (shell.exec("npm i loglevel=verbose").code !== 0) {
    shell.echo("Error: npm install failed");
    shell.exit(1);
  }
}
