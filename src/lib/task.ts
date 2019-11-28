import * as Listr from "listr";
import { createIndex, createReadMe, checkCurrentDirectory, createPackageJSON, createGitIgnore, createTsConfig } from "./create";

export const createProject = (directory: string) => {
  // ✔ Create index.ts
  // ✔ Create README.MD
  // ✔ Create package.json
  // ✔ Create .gitignore
  // ✔ Create tsconfig.json
  // create app.module.ts
  // create app.routing.module.ts
  // create environments
  // create controllers

  checkCurrentDirectory(directory);

  const tasks = new Listr([
    {
      title: "Create index.ts",
      task: () => createIndex(directory),
    },
    {
      title: "Create README.MD",
      task: () => createReadMe(directory),
    },
    {
      title: "Create package.json",
      task: () => createPackageJSON(directory),
    },
    {
      title: "Create .gitignore",
      task: () => createGitIgnore(directory),
    },
    {
      title: "Create tsconfig.json",
      task: () => createTsConfig(directory),
    },
  ]);

  tasks.run().catch((err: any) => {
    console.error(err);
  });
};
