import * as program from "commander";
import * as figlet from "figlet";
import * as chalk from "chalk";

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
    .name("maya")
    .usage("[options | command] [arguments]")
    .description(npm.description);

  program
    .command("new <directory>")
    .alias("n")
    .description("Creates a new MayaJS project based on the directory.")
    .action(createProject);

  program.parse(process.argv);

  if (program.args.length === 0) {
    console.log(chalk.red(figlet.textSync("MayaJS", { horizontalLayout: "full" })));
    program.outputHelp();
  }
}
