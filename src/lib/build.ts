import * as shell from "shelljs";
import ts from "typescript";
import { errorMessage } from "./utils";

export function build(options: ts.CompilerOptions): void {
  let program = ts.createProgram(["src/index.ts"], options);
  let emitResult = program.emit();
  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    console.log(errorMessage(diagnostic));
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  process.exit(exitCode);
}

export function cleanOutDir(options: { outDir: string }) {
  const cmd = shell.rm("-rf", options.outDir);
  if (cmd.code !== 0) {
    throw new Error("Error:Can't removed dist folder");
  }
}
