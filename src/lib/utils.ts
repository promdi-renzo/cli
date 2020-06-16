import path from "path";
import chalk from "chalk";
import ts from "typescript";

export function errorMessage(diagnostic: ts.Diagnostic): string {
  if (diagnostic.file) {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    const code = chalk.yellow("TS" + diagnostic.code);
    const fileName = chalk.green(path.basename(diagnostic.file.fileName));
    return `Error : ${code} ${fileName} (LINE=${chalk.yellow(line + 1)},CHAR=${chalk.yellow(character + 1)}): ${chalk.red(message)}`;
  } else {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  }
}
