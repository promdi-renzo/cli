import chalk from "chalk";
import ts from "typescript";
import { spawn } from "child_process";
import util from "util";
import path from "path";
import fs = require("fs");

const exec = util.promisify(require("child_process").exec);

let hasBuildError = false;
let hasLoaded = false;

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  hasBuildError = true;
  if (diagnostic.file) {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log("Error", diagnostic.code, ":", `${path.basename(diagnostic.file.fileName)} (${line + 1},${character + 1}):`, chalk.red(message));
  } else {
    console.error("Error", diagnostic.code, ":", ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine()));
  }
}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.log(chalk.green(`[mayajs] ${diagnostic.messageText}`));
}

function spawnCommand(port: number) {
  const cmd = spawn(`node build/index.js --port=${port}`, [], { shell: true });

  cmd.stdout.on("data", data => {
    console.log(`${data}`.trimEnd());
  });

  cmd.stderr.on("data", data => {
    console.error(`stderr: ${data}`);
  });

  cmd.on("error", err => {
    throw new Error("Error: Can't start server failed. " + err);
  });
}

export function serve(port: number) {
  const json = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dependencies = json.dependencies;

  const isMayaJS = Object.keys(dependencies).filter((key: string) => key.includes("@mayajs")).length > 0;

  if (!isMayaJS) {
    throw new Error(chalk.red("Couldn't find '@mayajs/core' module in this project."));
  }

  const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
  const host = ts.createWatchCompilerHost(configPath, { outDir: `build` }, ts.sys, createProgram, reportDiagnostic, reportWatchStatusChanged);
  const origCreateProgram = host.createProgram;

  host.createProgram = (rootNames: ReadonlyArray<string> | undefined, options, host, oldProgram) => {
    hasBuildError = false;
    console.log(chalk.yellow("[mayajs] Project files are being compile..."));
    return origCreateProgram(rootNames, options, host, oldProgram);
  };

  const origPostProgramCreate = host.afterProgramCreate;

  host.afterProgramCreate = program => {
    console.log(chalk.yellow("[mayajs] Compilation completed."));
    origPostProgramCreate!(program);
    if (!hasBuildError) {
      exec(`netstat -ano | findstr :${port}`)
        .then((data: any) => {
          if (data.stdout) {
            const portUsed = data.stdout
              .replace(/\r?\n|\r/g, "")
              .split(" ")
              .filter(Boolean)
              .slice(-1)[0];

            return exec(`taskkill /PID ${portUsed} /F`);
          }
        })
        .catch(() => {})
        .finally(() => {
          spawnCommand(port);
        });
    }

    if (!hasLoaded && !hasBuildError) {
      hasLoaded = true;
      console.log(chalk.green(`\n** MAYA Live Development Server is running on`), `http://localhost:${port}/`, chalk.green("**\n"));
    }
  };

  ts.createWatchProgram(host);
}
