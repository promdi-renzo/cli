import Listr from "listr";
import { checkCurrentDirectory, createController, getCurrentDirectory, createModelTs, createServiceTs } from "./create";
import { serve } from "./serve";
import { build, cleanOutDir } from "./build";
import chalk from "chalk";
import path from "path";
import * as shell from "shelljs";
import fs from "fs";
import { getContentsUTF8FromDirname, upperCaseWordWithDashes } from "./utils";

export const createProject = (directory: string, options: any) => {
  const templateDir = path.resolve(`${__dirname}`, "../templates");
  const defaultTemplate = `${templateDir}/default`;
  const isTemplateExist = fs.existsSync(templateDir);
  const isDefaultExist = fs.existsSync(defaultTemplate);

  if (!isTemplateExist || !isDefaultExist) {
    shell.rm("-rf", templateDir);
    shell.echo(chalk.yellow(`[mayajs] Downloading files for creating your MayaJS project...`));
    shell.exec(`git clone https://github.com/mayajs/templates.git ${templateDir}`, { silent: true });
    shell.rm("-rf", [`${templateDir}/.git`, `${templateDir}/README.md`]);
    shell.echo(chalk.green(`[mayajs] Download completed!`));
  }

  const projectDir = path.resolve(process.cwd(), directory);
  const projectExist = fs.existsSync(projectDir);

  if (projectExist) shell.rm("-rf", projectDir);

  shell.echo(chalk.yellow(`[mayajs] Preparing project files and directories...`));
  shell.cp("-Rf", defaultTemplate, projectDir);
  shell.echo(chalk.green(`[mayajs] Preparation completed!`));

  const projectname = upperCaseWordWithDashes(directory);
  const readme = `${projectDir}/README.md`;
  const packageJson = `${projectDir}/package.json`;

  shell.sed("-i", /([\s|\"])(MayaJS)/g, "$1" + projectname + " $2", [readme, packageJson]);
  const PACKAGE_DATA = getContentsUTF8FromDirname("../package.json");
  const PACKAGE_DATA_JSON = JSON.parse(PACKAGE_DATA);
  shell.sed("-i", /(version)/g, "$1 " + PACKAGE_DATA_JSON.version, readme);
  shell.sed("-i", /\"mayajs\"/, `"${directory.toLowerCase()}"`, packageJson);
  shell.cd(projectDir);
  shell.echo(chalk.yellow(`[mayajs] Installing project dependencies...\n`));
  shell.exec("npm i");
  shell.echo(chalk.green(`[mayajs] Installation completed!`));
  shell.echo(chalk.yellow(`[mayajs] Running your project for the first time...`));
  runServer({ port: 3333 });
};

export const createComponent = (component: string, directory: string, options: any) => {
  const dir_array = directory.split(/\\|\//);
  const name = dir_array[dir_array.length - 1];
  const dir = dir_array.reduce((acc: string, cur: string, index: number) => {
    checkCurrentDirectory(acc);
    return `${acc}/${cur}`;
  }, "src");
  const isRoute = component === "r" || component === "route";
  const currentDirectory = isRoute ? dir : "src";
  const filename = isRoute ? `/${name}` : `/${directory}`;
  const workingDirectory = checkCurrentDirectory(currentDirectory) + filename;
  const tasks = chooseComponent(component, directory, name);

  if (tasks) {
    tasks.run({ directory: workingDirectory, name, schema: options.schema }).catch((err: any) => {
      console.error(err);
    });
  }
};

function chooseComponent(component: string, directory: string, name: string): Listr<any> | null {
  let tasks: Listr | null = null;

  if (component === "r" || component === "route") {
    tasks = createRoutesTaskList(directory, name);
  }

  if (component === "c" || component === "controller") {
    tasks = createControllerTaskList(directory, name);
  }

  if (component === "s" || component === "services") {
    tasks = createServicesTaskList(directory, name);
  }

  if (component === "m" || component === "model") {
    tasks = createModelTask(directory, name);
  }

  return tasks;
}

function createRoutesTaskList(directory: string, name: string) {
  const workingDirectory = `src/${directory}/${name}`;
  return new Listr([
    { title: taskTitle("create", `${workingDirectory}.controller.ts`), task: createController },
    { title: taskTitle("create", `${workingDirectory}.service.ts`), task: createServiceTs },
  ]);
}

function createControllerTaskList(directory: string, name: string) {
  return new Listr([{ title: taskTitle("create", `src/${directory}/${name}.controller.ts`), task: createController }]);
}

function createServicesTaskList(directory: string, name: string) {
  return new Listr([{ title: taskTitle("create", `src/${directory}/${name}.service.ts`), task: createServiceTs }]);
}

function createModelTask(directory: string, name: string) {
  return new Listr([{ title: taskTitle("create", `src/${directory}/${name}.model.ts`), task: createModelTs }]);
}

function taskTitle(type: string, value: string) {
  let title = "";

  if (type === "create") {
    title = `${chalk.green("create")} ${getCurrentDirectory(value)}`.replace(process.cwd(), "");
  }

  if (type === "execute") {
    title = chalk.yellow(value);
  }

  return title;
}

export async function runServer(cmd: any) {
  try {
    cleanOutDir({ outDir: process.cwd() + "/dist" });
    serve(cmd.port ? cmd.port : 3333);
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
}

export function buildProject() {
  let tasks = new Listr([]);

  const cwd = process.cwd();
  const options = {
    rootDir: `${cwd}/src`,
    outDir: `${cwd}/dist`,
    project: `${cwd}/tsconfig.json`,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: "ES5",
    esModuleInterop: true,
  };

  tasks = new Listr([
    { title: taskTitle("execute", `Clean dist folder`), task: cleanOutDir },
    { title: taskTitle("execute", `Build project`), task: build },
  ]);

  tasks.run(options).catch((err: any) => {
    console.error(err);
  });
}
