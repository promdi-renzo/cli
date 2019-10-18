#! /usr/bin/env node

import * as program from "commander";
import * as path from "path";
import * as Listr from "listr";
import { gitClone, removeGit, updateJson, installDependency } from "./lib/create";

const NPM = path.join(__dirname, "package.json");

import(NPM)
  .then(runCLI)
  .catch(error => console.log(error));

function runCLI(npm: any) {
  program.version(npm.version).description(npm.description);

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
          title: "Removing git folder",
          task: () => removeGit(),
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

  program.parse(process.argv);
}
