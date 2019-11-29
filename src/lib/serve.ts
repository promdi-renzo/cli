import * as shell from "shelljs";

export function serve() {
  const cmd = shell.exec("npx nodemon --exec npx ts-node src/index.ts");
  console.log(cmd);
  if (cmd.code !== 0) {
    throw new Error("Error:Can't start server failed");
  }
}
