import * as Listr from "listr";
import { gitClone, removeGit, updateJson, installDependency } from "./create";

export const createProject = (dir: string) => {
  const tasks = new Listr([
    {
      title: "Copying files",
      task: () => gitClone(dir),
    },
    {
      title: "Removing git folder",
      task: () => removeGit(),
    },
    {
      title: "Updating package.json",
      task: () => updateJson(dir),
    },
    {
      title: "Installing dependencies",
      task: () => installDependency(),
    },
  ]);

  tasks.run().catch((err: any) => {
    console.error(err);
  });
};
