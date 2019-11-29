import * as shell from "shelljs";
import * as chalk from "chalk";

export function serve() {
  console.log(chalk.green("** MAYA Live Development Server is on http://localhost:3333/**"));
  const cmd = shell.exec("npx nodemon --exec npx ts-node src/index.ts");
  if (cmd.code !== 0) {
    throw new Error("Error:Can't start server failed");
  }
}
