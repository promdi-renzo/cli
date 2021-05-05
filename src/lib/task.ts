import Listr from "listr";
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
  createModelTs,
  createServiceTs,
  gitInit,
  installDependency,
  createAppController,
} from "./create";
import { serve } from "./serve";
import { build, cleanOutDir } from "./build";
import chalk from "chalk";

export const createProject = (directory: string) => {
  checkCurrentDirectory(directory);

  const tasks = new Listr([
    { title: taskTitle("create", `${directory}/src/index.ts`), task: createIndex },
    { title: taskTitle("create", `${directory}/src/app.module.ts`), task: createAppModule },
    { title: taskTitle("create", `${directory}/src/app.routing.module.ts`), task: createAppRoutingModule },
    { title: taskTitle("create", `${directory}/src/environment`), task: createEnvironment },
    { title: taskTitle("create", `${directory}/src/controller`), task: createAppController },
    { title: taskTitle("create", `${directory}/README.md`), task: createReadMe },
    { title: taskTitle("create", `${directory}/.gitignore`), task: createGitIgnore },
    { title: taskTitle("create", `${directory}/package.json`), task: createPackageJSON },
    { title: taskTitle("create", `${directory}/tsconfig.json`), task: createTsConfig },
    { title: taskTitle("execute", "Initialize git repository"), task: gitInit },
    { title: taskTitle("execute", "Install project dependencies"), task: installDependency },
  ]);

  tasks.run(directory).catch((err: any) => {
    console.error(err);
  });
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

export async function runServer(cmd: any, options: any) {
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

  tasks = new Listr([{ title: taskTitle("execute", `Clean dist folder`), task: cleanOutDir }, { title: taskTitle("execute", `Build project`), task: build }]);

  tasks.run(options).catch((err: any) => {
    console.error(err);
  });
}
