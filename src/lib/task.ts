import * as Listr from "listr";
import {
  createIndex,
  createReadMe,
  checkCurrentDirectory,
  createPackageJSON,
  createGitIgnore,
  createTsConfig,
  createAppModule,
  createAppRoutingModule,
  createEnvironment,
  createController,
  getCurrentDirectory,
  createControllerTs,
  createModelTs,
  createServiceTs,
} from "./create";
import * as chalk from "chalk";

export const createProject = (directory: string) => {
  const cur_dir = checkCurrentDirectory(directory);

  const tasks = new Listr([
    { title: `${chalk.green("create")} ${cur_dir}/index.ts`, task: createIndex },
    { title: `${chalk.green("create")} ${cur_dir}/README.md`, task: createReadMe },
    { title: `${chalk.green("create")} ${cur_dir}/package.json`, task: createPackageJSON },
    { title: `${chalk.green("create")} ${cur_dir}/.gitignore`, task: createGitIgnore },
    { title: `${chalk.green("create")} ${cur_dir}/tsconfig.json`, task: createTsConfig },
    { title: `${chalk.green("create")} ${cur_dir}/app.module.ts`, task: createAppModule },
    { title: `${chalk.green("create")} ${cur_dir}/app.routing.module.ts`, task: createAppRoutingModule },
    { title: `${chalk.green("create")} ${cur_dir}/src/environment`, task: createEnvironment },
    { title: `${chalk.green("create")} ${cur_dir}/src/controller`, task: createController },
  ]);

  tasks.run(directory).catch((err: any) => {
    console.error(err);
  });
};

export const createComponent = (component: string, directory: string) => {
  let tasks = new Listr([]);
  const dir_array = directory.split(/\\|\//);
  const name = dir_array[dir_array.length - 1];

  checkCurrentDirectory("src");

  const dir = dir_array.reduce((acc: string, cur: string) => {
    checkCurrentDirectory(`${acc}/${cur}`);
    return `${acc}/${cur}`;
  }, "src");

  const workingDirectory = checkCurrentDirectory(dir);

  if (component === "c" || component === "controller") {
    tasks = createControllerTaskList(directory, name);
  }

  if (component === "s" || component === "services") {
    tasks = createServicesTaskList(directory, name);
  }

  tasks.run({ directory: workingDirectory, name }).catch((err: any) => {
    console.error(err);
  });
};

function createControllerTaskList(directory: string, name: string) {
  return new Listr([
    {
      title: `${chalk.green("create")} ${getCurrentDirectory(`src/${directory}/${name}.controller.ts`)}`.replace(process.cwd(), ""),
      task: createControllerTs,
    },
    {
      title: `${chalk.green("create")} ${getCurrentDirectory(`src/${directory}/${name}.model.ts`)}`.replace(process.cwd(), ""),
      task: createModelTs,
    },
    {
      title: `${chalk.green("create")} ${getCurrentDirectory(`src/${directory}/${name}.service.ts`)}`.replace(process.cwd(), ""),
      task: createServiceTs,
    },
  ]);
}

function createServicesTaskList(directory: string, name: string) {
  return new Listr([
    {
      title: `${chalk.green("create")} ${getCurrentDirectory(`src/${directory}/${name}.service.ts`)}`.replace(process.cwd(), ""),
      task: createServiceTs,
    },
  ]);
}
