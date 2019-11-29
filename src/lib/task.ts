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
  if (component === "c" || component === "controller") {
    console.log("Creating controller component...");
  }

  if (component === "s" || component === "services") {
    console.log("Creating services component...");
  }
};
