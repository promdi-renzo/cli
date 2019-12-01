import * as shell from "shelljs";
import * as chalk from "chalk";

export function serve(port: number) {
  console.log(chalk.green(`** MAYA Live Development Server is on http://localhost:${port}/ **\n`));
  const cmd = shell.exec(`npx nodemon --exec npx ts-node src/index.ts --port=${port}`);
  if (cmd.code !== 0) {
    throw new Error("Error:Can't start server failed");
  }
}
