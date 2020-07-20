import path from "path";
import chalk from "chalk";
import ts from "typescript";

export function errorMessage(diagnostic: ts.Diagnostic): string {
  if (diagnostic.file) {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    let fileName = diagnostic.file.fileName;
    const code = chalk.yellow("TS" + diagnostic.code);

    if (diagnostic.file.fileName.includes("src")) {
      const pathName = diagnostic.file.fileName.match(/([\/|\\]src.*)/) || [];
      fileName = `.${pathName[0]}`;
    }

    return `Error : ${code} ${chalk.green(fileName)} (LINE=${chalk.yellow(line + 1)},CHAR=${chalk.yellow(character + 1)}): ${chalk.red(message)}`;
  } else {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  }
}
