import * as Listr from "listr";
import { createIndex, createReadMe, checkCurrentDirectory, createPackageJSON } from "./create";

export const createProject = (directory: string) => {
  // ✔ Create index.ts
  // ✔ Create README.MD
  // create package.json
  // create .gitignore
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
  ]);

  tasks.run().catch((err: any) => {
    console.error(err);
  });
};
