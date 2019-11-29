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

export const createProject = (directory: string) => {
  const cur_dir = checkCurrentDirectory(directory);

  const tasks = new Listr([
    { title: `Create ${cur_dir}/index.ts`, task: createIndex },
    { title: `Create ${cur_dir}/README.md`, task: createReadMe },
    { title: `Create ${cur_dir}/package.json`, task: createPackageJSON },
    { title: `Create ${cur_dir}/.gitignore`, task: createGitIgnore },
    { title: `Create ${cur_dir}/tsconfig.json`, task: createTsConfig },
    { title: `Create ${cur_dir}/app.module.ts`, task: createAppModule },
    { title: `Create ${cur_dir}/app.routing.module.ts`, task: createAppRoutingModule },
    { title: `Create ${cur_dir}/src/environment`, task: createEnvironment },
    { title: `Create ${cur_dir}/src/controller`, task: createController },
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
    tasks = new Listr([
      {
        title: `Create ${getCurrentDirectory(`src/${directory}/${name}.controller.ts`)}`,
        task: createControllerTs,
      },
      {
        title: `Create ${getCurrentDirectory(`src/${directory}/${name}.model.ts`)}`,
        task: createModelTs,
      },
      {
        title: `Create ${getCurrentDirectory(`src/${directory}/${name}.service.ts`)}`,
        task: createServiceTs,
      },
    ]);
  }

  if (component === "s" || component === "services") {
    tasks = new Listr([
      {
        title: `Create ${getCurrentDirectory(`src/${directory}/${name}.service.ts`)}`,
        task: createServiceTs,
      },
    ]);
  }

  tasks.run({ directory: workingDirectory, name }).catch((err: any) => {
    console.error(err);
  });
};
