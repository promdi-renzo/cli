import * as program from "commander";

// TASKS
import { createProject } from "./task";

// INTERFACE
interface NpmPackage {
  version: string;
  description: string;
}

export default function runCLI(npm: NpmPackage) {
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
