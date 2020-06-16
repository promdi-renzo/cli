import * as shell from "shelljs";
import ts from "typescript";
import chalk from "chalk";
import fs from "fs";
import { errorMessage } from "./utils";

export function build(options: ts.CompilerOptions): void {
  console.log(chalk.yellow("[mayajs] Start building your project..."));

  let program = ts.createProgram(["src/index.ts"], options);
  let emitResult = program.emit();
  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  let message = "";

  allDiagnostics.forEach(diagnostic => {
    console.log("\n", errorMessage(diagnostic), "\n");
  });


  if (allDiagnostics.length > 0) {
    message = ` with ${allDiagnostics.length} error${allDiagnostics.length > 1 ? "s" : ""}`;
  } else {
    fs.copyFile("package.json", "dist/package.json", err => {
      if (err) throw err;
    });
  }

  console.log(chalk.green(`[mayajs] Build finished${message}!`));
  process.exit(0);
}

export function cleanOutDir(options: { outDir: string }) {
  const cmd = shell.rm("-rf", options.outDir);
  if (cmd.code !== 0) {
    throw new Error("Error:Can't removed dist folder");
  }
}
