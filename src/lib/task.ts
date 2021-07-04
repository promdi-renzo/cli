import { Listr } from "listr2";
import { checkCurrentDirectory, createController, getCurrentDirectory, createModelTs, createServiceTs } from "./create";
import { serve } from "./serve";
import { build, cleanOutDir } from "./build";
import chalk from "chalk";
import { getContentsUTF8FromDirname, upperCaseWordWithDashes } from "./utils";
import inquirer from "inquirer";
import { templateDir, templatesFolderDir, templateTasks } from "./template";

export const chooseAction = async () => {
  const choices = ["create", "generate", "run", "build", "help"];
  const question = { type: "list", name: "action", message: "Choose an action you want to perform", choices, default: choices[0] };
  return await inquirer.prompt([question]);
};

export const createCommand = async () => {
  const choices = ["default", "custom"];
  const question = [
    { name: "directory", message: "Enter project name" },
    { type: "list", name: "template", message: "Choose a template", choices, default: choices[0] },
  ];
  let { directory, template } = await inquirer.prompt(question);

  if (template === "custom") {
    const { custom } = await inquirer.prompt({ name: "custom", message: "Enter template name" });
    template = custom;
  }

  createProject(directory, { template });
};

export const createProject = async (directory: string, options: any) => {
  const PACKAGE_DATA = getContentsUTF8FromDirname("../package.json");
  const PROJECT_DATA_JSON = JSON.parse(PACKAGE_DATA);
  const tasks: Listr = new Listr(templateTasks(options));
  const ctx = { PROJECT_DATA_JSON, directory, templatesFolderDir, templateDir, template: options?.template };

  tasks
    .run(ctx)
    .then(() => runServer({ port: 3333 }))
    .catch((err: any) => console.error(err));
};

export const createComponent = async (component: string, directory: string, options: any) => {
  const args = { r: "route", c: "controller", s: "service", m: "model" };
  let selectedArgs = args[component.charAt(0)];

  if (!selectedArgs) {
    const componentList = ["route", "controller", "service", "model"];
    const question = { type: "list", name: "arg", message: "Choose a component to generate", choices: componentList, default: componentList[0] };
    const answer = await inquirer.prompt([question]);
    component = selectedArgs = answer.arg;
  }

  const choices = ["mongo", "sql"];
  const dir_array = directory.split(/\\|\//);
  const name = dir_array[dir_array.length - 1];
  const taskList = chooseComponentTask(selectedArgs, directory, name);
  const tasks: Listr = new Listr(taskList);

  if (selectedArgs === "model" && (!options?.schema || !choices.includes(options?.schema))) {
    const question = { type: "list", name: "schema", message: "Choose a schema", choices, default: choices[0] };
    options = await inquirer.prompt([question]);
  }

  const dir = dir_array.reduce((acc: string, cur: string, index: number) => {
    checkCurrentDirectory(acc);
    return `${acc}/${cur}`;
  }, "src");
  const isRoute = component === "r" || component === "route";
  const currentDirectory = isRoute ? dir : "src";
  const filename = isRoute ? `/${name}` : `/${directory}`;
  const workingDirectory = checkCurrentDirectory(currentDirectory) + filename;

  tasks.run({ directory: workingDirectory, name, noImports: !isRoute, ...options }).catch((err: any) => {
    console.error(err);
  });
};

function chooseComponentTask(arg: string, directory: string, name: string) {
  const task = { controller: createController, service: createServiceTs, model: createModelTs };
  const create = (arr: string[]) => arr.map((e) => ({ title: taskTitle("create", `src/${directory}/${name}.${e}.ts`), task: task[e] }));
  return arg === "route" ? create(["controller", "service"]) : create([arg]);
}

function taskTitle(type: string, value: string) {
  const title = {
    create: `${chalk.green("create")} ${getCurrentDirectory(value)}`.replace(process.cwd(), ""),
    execute: chalk.yellow(value),
  };
  return title[type];
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
