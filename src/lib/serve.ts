import chalk from "chalk";
import ts from "typescript";
import { spawn } from "child_process";
import util from "util";
import { errorMessage } from "./utils";
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
  console.log(errorMessage(diagnostic));
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

function taskKill(port: number) {
  return (data: any) => {
    if (data.stdout) {
      const portUsed = data.stdout
        .replace(/\r?\n|\r/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(-1)[0];

      console.log(chalk.yellow(`[mayajs] Port ${port} is already use.`));
      return exec(`taskkill /PID ${portUsed} /F`);
    }
  };
}

async function killUsedPort(port: number, tries = 1): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    const portTerminated = (data: any) => {
      if (data.stdout.includes("SUCCESS")) {
        console.log(chalk.yellow(`[mayajs] Port ${port} is now teminated and ready to use.`));
        return resolve();
      }

      throw new Error("taskkill not completed");
    };

    const catchError = (error: any): void | Promise<any> => {
      const message = error.message ? error.message : error;

      if (message.includes("netstat")) {
        return resolve();
      }

      if (tries > 3) {
        console.log(chalk.red(message));
        return killUsedPort(port);
      }
    };

    exec(`netstat -ano | findstr :${port}`)
      .then(taskKill(port))
      .then(portTerminated)
      .catch(catchError);
  });
}

function restart(port: number, origPostProgramCreate: ((program: ts.SemanticDiagnosticsBuilderProgram) => void) | undefined) {
  return (program: ts.SemanticDiagnosticsBuilderProgram) => {
    console.log(chalk.yellow("[mayajs] Compilation completed."));
    origPostProgramCreate!(program);
    if (!hasBuildError) {
      killUsedPort(port).finally(() => {
        spawnCommand(port);

        if (!hasLoaded && !hasBuildError) {
          hasLoaded = true;
          console.log(chalk.green(`\n** MAYA Live Development Server is running on`), `http://localhost:${port}/`, chalk.green("**\n"));
        }
      });
    }
  };
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
  host.afterProgramCreate = restart(port, origPostProgramCreate);

  ts.createWatchProgram(host);
}
