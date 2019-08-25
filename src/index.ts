#! /usr/bin/env node

import * as program from "commander";
import * as path from "path";
import * as shell from "shelljs";
import * as Listr from "listr";
import * as fs from "fs";

const NPM = path.join(__dirname, "../package.json");

import(NPM)
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
      const tasks = new Listr([
        {
          title: "Copying files",
          task: () => gitClone(dir),
        },
        {
          title: "Updating package.json",
          task: () => updateJson(dir),
        },
        {
          title: "Installing dependencies",
          task: () => installDependency(),
        },
      ]);

      tasks.run().catch((err: any) => {
        console.error(err);
      });
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
  if (shell.exec("npm i").code !== 0) {
    shell.echo("Error: npm install failed");
    shell.exit(1);
  }
}

function updateJson(dir: string) {
  try {
    const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");
    const rawdata = fs.readFileSync(PACKAGE_JSON);
    let data = JSON.parse(rawdata.toString());
    data.name = dir;
    data.author = "";
    data.keywords = ["mayajs"];
    data.version = "1.0.0";
    delete data.bugs;
    delete data.homepage;
    delete data.repository;
    const NEW_DATA = JSON.stringify(data);
    fs.writeFileSync(PACKAGE_JSON, NEW_DATA);
  } catch (error) {
    console.log(error);
  }
}
