import * as program from "commander";
import * as figlet from "figlet";
import * as chalk from "chalk";

// TASKS
import { createProject, createComponent, runServer } from "./task";

// INTERFACE
interface NpmPackage {
  version: string;
  description: string;
}

export default function runCLI(npm: NpmPackage) {
  program
    .version(npm.version, "-v, --version")
    .name("maya")
    .usage("[options | command] [arguments]")
    .description(npm.description);

  program
    .command("new <directory>")
    .alias("n")
    .description(
      `Creates a new MayaJS project.
    ${chalk.green("maya new my-new-app")} | ${chalk.green("maya n my-new-app")}
    `
    )
    .action(createProject);

  program
    .command("generate <component> <directory>")
    .alias("g")
    .description(
      `Creates a new component.
 
    CONTROLLER
    ${chalk.green("maya generate controller sample")} | ${chalk.green("maya g c sample\n")}
    SERVICE
    ${chalk.green("maya generate service sample")} | ${chalk.green("maya g s sample\n")}
    MODEL
    ${chalk.green("maya generate model sample")} | ${chalk.green("maya g m sample")}
    `
    )
    .action(createComponent);

  program
    .command("serve")
    .alias("s")
    .description(
      `Run the server.
    ${chalk.green("maya serve")} | ${chalk.green("maya s")}
    `
    )
    .action(runServer);

  program.parse(process.argv);

  if (program.args.length === 0) {
    console.log(chalk.red(figlet.textSync("MayaJS", { horizontalLayout: "full" })));
    program.outputHelp();
  }
}
