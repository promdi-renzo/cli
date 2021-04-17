import program from "commander";
import figlet from "figlet";
import chalk from "chalk";

// TASKS
import { createProject, createComponent, runServer, buildProject } from "./task";

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

    ROUTE
    ${chalk.green("maya generate route sample")} | ${chalk.green("maya g r sample\n")}
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
    .option("-p, --port [port]", "Change port number")
    .option("-p, --port=[port]", "Change port number")
    .description(
      `Run the server.
    ${chalk.green("maya serve")} | ${chalk.green("maya s")}

    OPTIONS:
    -p, --port    Change port number
    ${chalk.green("maya serve --port 4444")}
    `
    )
    .action(runServer);

  program
    .command("build")
    .alias("b")
    .description(
      `Build project.
    ${chalk.green("maya build")} | ${chalk.green("maya b")}`
    )
    .action(buildProject);

  program.parse(process.argv);

  if (process.argv.length === 2) {
    console.log(chalk.red(figlet.textSync("MayaJS", { horizontalLayout: "full" })));
    program.outputHelp();
  }
}
