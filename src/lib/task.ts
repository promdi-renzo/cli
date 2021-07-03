import Listr from "listr";
import { checkCurrentDirectory, createController, getCurrentDirectory, createModelTs, createServiceTs } from "./create";
import { serve } from "./serve";
import { build, cleanOutDir } from "./build";
import chalk from "chalk";
import path from "path";
import * as shell from "shelljs";
import fs from "fs";
import { getContentsUTF8FromDirname, upperCaseWordWithDashes } from "./utils";
import https from "https";
import inquirer from "inquirer";

export const createProject = async (directory: string, options: any) => {
  const templatesFolderDir = path.resolve(`${__dirname}`, "../templates");
  let templateDir = `${templatesFolderDir}/default`;
  const isTemplateExist = fs.existsSync(templatesFolderDir);
  const isDefaultExist = fs.existsSync(templateDir);
  const task = [];

  if (!isTemplateExist || !isDefaultExist) {
    task.push({
      title: chalk.green(`Downloading files for creating your MayaJS project...`),
      task: () => {
        shell.rm("-rf", templatesFolderDir);
        shell.exec(`git clone https://github.com/mayajs/templates.git ${templatesFolderDir}`, { silent: true });
        shell.rm("-rf", [`${templatesFolderDir}/.git`, `${templatesFolderDir}/README.md`]);
      },
    });
  }

  const PACKAGE_DATA = getContentsUTF8FromDirname("../package.json");
  const PROJECT_DATA_JSON = JSON.parse(PACKAGE_DATA);

  if (options?.template) {
    const promise = new Promise((resolve, reject) => {
      https
        .get("https://raw.githubusercontent.com/mayajs/templates/master/templates.json", (res) => {
          let data: any[] = [];
          res.on("data", (chunk) => data.push(chunk));
          res.on("end", () => {
            const templateData = JSON.parse(Buffer.concat(data).toString());
            resolve(JSON.stringify(templateData, null, 2));
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    const templateJSON = path.resolve(templatesFolderDir, "./templates.json");
    const PACKAGE_DATA = getContentsUTF8FromDirname(templateJSON);

    if (!Object.keys(JSON.parse(PACKAGE_DATA))?.length || Object.keys(PACKAGE_DATA)?.length === 0) {
      task.push({
        title: chalk.green(`Updating template list...`),
        task: async () => {
          fs.writeFileSync(`${templatesFolderDir}/templates.json`, await promise);
        },
      });
    }

    const DATA_JSON = JSON.parse(PACKAGE_DATA);
    let selectedVersion = { version: "", url: "" };

    task.push({
      title: chalk.green(`Searching template list...`),
      task: async () => {
        Object.keys(DATA_JSON).some((key) => {
          if (key === options?.template) {
            const versions: { version: string; cli: string; url: string }[] = DATA_JSON[key].versions;
            return versions.some((version) => {
              const split = version.cli.split(".");
              const projectVersion = PROJECT_DATA_JSON.version.split(".");
              const isMatched = +split[0] >= +projectVersion[0] && +split[1] >= +projectVersion[1];
              if (isMatched) selectedVersion = version;
              if (selectedVersion.url !== "") shell.echo(chalk.green(`[mayajs] Template has been found!`));
              return !isMatched;
            });
          }
          return false;
        });
      },
    });

    if (selectedVersion.url === "") {
      task.push({
        title: chalk.green(`Downloading template files for your project...`),
        task: async () => {
          const data = await promise;
          fs.writeFileSync(`${templatesFolderDir}/templates.json`, data);
          shell.echo(chalk.red(`[mayajs] Template name doesn't exist.`));
        },
      });

      const tasks: Listr = new Listr(task);
      return tasks.run().catch((err: any) => console.error(err));
    }

    templateDir = `${templatesFolderDir}/${options?.template}/${selectedVersion.version}`;

    if (!fs.existsSync(templateDir)) {
      task.push({
        title: chalk.green(`Downloading template files for your project...`),
        task: async () => {
          shell.exec(`git clone ${selectedVersion.url} ${templateDir}`, { silent: true });
          shell.rm("-rf", [`${templateDir}/.git`]);
        },
      });
    }
  }

  const projectDir = path.resolve(process.cwd(), directory);
  const projectExist = fs.existsSync(projectDir);

  if (projectExist) shell.rm("-rf", projectDir);

  task.push({
    title: chalk.green(`Preparing project files and directories...`),
    task: async () => {
      shell.cp("-Rf", templateDir, projectDir);
    },
  });

  task.push({
    title: chalk.green(`Installing project dependencies...`),
    task: async () => {
      const projectname = upperCaseWordWithDashes(directory);
      const readme = `${projectDir}/README.md`;
      const packageJson = `${projectDir}/package.json`;
      shell.sed("-i", /([\s|\"])(MayaJS)/g, "$1" + projectname + " $2", [readme, packageJson]);
      shell.sed("-i", /(version)/g, "$1 " + PROJECT_DATA_JSON.version, readme);
      shell.sed("-i", /\"mayajs\"/, `"${directory.toLowerCase()}"`, packageJson);
      shell.cd(projectDir);
      shell.exec("npm i --error");
    },
  });

  const tasks: Listr = new Listr(task);

  tasks
    .run()
    .then(() => {
      shell.echo(chalk.yellow(`[mayajs] Running your project for the first time...`));
      runServer({ port: 3333 });
    })
    .catch((err: any) => {
      console.error(err);
    });
};

export const createComponent = async (component: string, directory: string, options: any) => {
  const args = { r: "route", c: "controller", s: "service", m: "model" };
  let selectedArgs = args[component.charAt(0)];

  if (!selectedArgs) {
    const componentList = ["route", "controller", "service", "model"];
    const question = { type: "list", name: "arg", message: "Choose a component to generate", choices: componentList, default: componentList[0] };
    const answer = await inquirer.prompt([question]);
    component = selectedArgs = answer.arg;
  }

  const choices = ["mongo", "sql"];
  const dir_array = directory.split(/\\|\//);
  const name = dir_array[dir_array.length - 1];
  const taskList = chooseComponentTask(selectedArgs, directory, name);
  const tasks: Listr = new Listr(taskList);

  if (selectedArgs === "model" && (!options?.schema || !choices.includes(options?.schema))) {
    const question = { type: "list", name: "schema", message: "Choose a schema", choices, default: choices[0] };
    options = await inquirer.prompt([question]);
  }

  const dir = dir_array.reduce((acc: string, cur: string, index: number) => {
    checkCurrentDirectory(acc);
    return `${acc}/${cur}`;
  }, "src");
  const isRoute = component === "r" || component === "route";
  const currentDirectory = isRoute ? dir : "src";
  const filename = isRoute ? `/${name}` : `/${directory}`;
  const workingDirectory = checkCurrentDirectory(currentDirectory) + filename;

  tasks.run({ directory: workingDirectory, name, noImports: !isRoute, ...options }).catch((err: any) => {
    console.error(err);
  });
};

function chooseComponentTask(arg: string, directory: string, name: string) {
  const task = { controller: createController, service: createServiceTs, model: createModelTs };
  const create = (arr: string[]) => arr.map((e) => ({ title: taskTitle("create", `src/${directory}/${name}.${e}.ts`), task: task[e] }));
  return arg === "route" ? create(["controller", "service"]) : create([arg]);
}

function taskTitle(type: string, value: string) {
  const title = {
    create: `${chalk.green("create")} ${getCurrentDirectory(value)}`.replace(process.cwd(), ""),
    execute: chalk.yellow(value),
  };
  return title[type];
}

export async function runServer(cmd: any) {
  try {
    cleanOutDir({ outDir: process.cwd() + "/dist" });
    serve(cmd.port ? cmd.port : 3333);
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
}

export function buildProject() {
  let tasks = new Listr([]);

  const cwd = process.cwd();
  const options = {
    rootDir: `${cwd}/src`,
    outDir: `${cwd}/dist`,
    project: `${cwd}/tsconfig.json`,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: "ES5",
    esModuleInterop: true,
  };

  tasks = new Listr([
    { title: taskTitle("execute", `Clean dist folder`), task: cleanOutDir },
    { title: taskTitle("execute", `Build project`), task: build },
  ]);

  tasks.run(options).catch((err: any) => {
    console.error(err);
  });
}
