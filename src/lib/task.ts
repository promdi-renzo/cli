import * as Listr from "listr";
import { createIndex } from "./create";

export const createProject = (dir: string) => {
  // ✔ Create index.ts
  // create README.MD
  // create package.json
  // create LICENCE
  // create app.module.ts
  // create app.routing.module.ts
  // create environments
  // create controllers

  const tasks = new Listr([
    {
      title: "Creating index.ts",
      task: () => createIndex(),
    },
  ]);

  tasks.run().catch((err: any) => {
    console.error(err);
  });
};
