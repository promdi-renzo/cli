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
} from "./create";

export const createProject = (directory: string) => {
  // ✔ Create index.ts
  // ✔ Create README.MD
  // ✔ Create package.json
  // ✔ Create .gitignore
  // ✔ Create tsconfig.json
  // ✔ Create app.module.ts
  // ✔ Create app.routing.module.ts
  // ✔ Create environments
  // create controllers

  checkCurrentDirectory(directory);

  const tasks = new Listr([
    { title: "Create index.ts", task: createIndex },
    { title: "Create README.md", task: createReadMe },
    { title: "Create package.json", task: createPackageJSON },
    { title: "Create .gitignore", task: createGitIgnore },
    { title: "Create tsconfig.json", task: createTsConfig },
    { title: "Create app.module.ts", task: createAppModule },
    { title: "Create app.routing.module.ts", task: createAppRoutingModule },
    { title: "Create environment", task: createEnvironment },
  ]);

  tasks.run(directory).catch((err: any) => {
    console.error(err);
  });
};
