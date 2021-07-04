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
  const commonDir = `${templatesFolderDir}/common`;
  let templateDir = `${templatesFolderDir}/default`;
  const isTemplateExist = fs.existsSync(templatesFolderDir);
  const isDefaultExist = fs.existsSync(templateDir);
  const task = [];

  task.push({
    title: chalk.green(`Updating template folder...`),
    task: () => {
      const temp = `${templatesFolderDir}/temp`;
      shell.exec(`git clone https://github.com/mayajs/templates.git ${temp}`, { silent: true });
      shell.cp("-Rf", `${temp}/common`, `${templatesFolderDir}/common`);
      shell.rm("-rf", temp);
    },
    enabled: () => !fs.existsSync(commonDir),
  });

  task.push({
    title: chalk.green(`Downloading files for creating your MayaJS project...`),
    task: () => {
      shell.rm("-rf", templatesFolderDir);
      shell.exec(`git clone https://github.com/mayajs/templates.git ${templatesFolderDir}`, { silent: true });
      shell.rm("-rf", [`${templatesFolderDir}/.git`, `${templatesFolderDir}/README.md`]);
    },
    enabled: () => !isTemplateExist || !isDefaultExist,
  });

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

    if (!fs.existsSync(templateJSON)) {
      fs.writeFileSync(`${templatesFolderDir}/templates.json`, "{}");
    }

    const TEMPLATE_JSON_DATA = getContentsUTF8FromDirname(templateJSON);

    task.push({
      title: chalk.green(`Updating template list...`),
      task: async (ctx: any, task: any) => {
        fs.writeFileSync(`${templatesFolderDir}/templates.json`, await promise);
        ctx["DATA_JSON"] = getContentsUTF8FromDirname(templateJSON);
      },
      enabled: () => !Object.keys(JSON.parse(TEMPLATE_JSON_DATA))?.length || Object.keys(TEMPLATE_JSON_DATA)?.length === 0,
    });

    let selectedVersion = { version: "", url: "" };

    task.push({
      title: chalk.green(`Searching template list...`),
      task: async (ctx: any, task: any) => {
        const DATA_JSON = JSON.parse(ctx.DATA_JSON ?? getContentsUTF8FromDirname(templateJSON));
        Object.keys(DATA_JSON).some((key) => {
          if (key === options?.template) {
            const versions: { version: string; cli: string; url: string }[] = DATA_JSON[key].versions;
            return versions.some((version) => {
              const split = version.cli.split(".");
              const projectVersion = PROJECT_DATA_JSON.version.split(".");
              const isMatched = +split[0] >= +projectVersion[0] && +split[1] >= +projectVersion[1];
              if (isMatched) selectedVersion = version;
              ctx["selectedVersion"] = selectedVersion;
              return !isMatched;
            });
          }
          return false;
        });

        if (ctx.selectedVersion === "") {
          const data = await promise;
          fs.writeFileSync(`${templatesFolderDir}/templates.json`, data);
          throw new Error("Template name doesn't exist.");
        }
      },
    });

    task.push({
      title: chalk.green(`Downloading template files for your project...`),
      task: (ctx: any, task: any) => {
        templateDir = `${templatesFolderDir}/${options?.template}/${ctx.selectedVersion.version}`;
        if (fs.existsSync(ctx.templateDir)) {
          task.skip();
          return;
        }
        shell.exec(`git clone ${ctx.selectedVersion.url} ${templateDir}`, { silent: true });
        shell.rm("-rf", [`${templateDir}/.git`]);
      },
    });
  }

  const projectDir = path.resolve(process.cwd(), directory);
  const projectExist = fs.existsSync(projectDir);

  if (projectExist) shell.rm("-rf", projectDir);

  task.push({
    title: chalk.green(`Preparing project files and directories...`),
    task: () => {
      shell.cp("-Rf", templateDir, projectDir);
    },
  });

  task.push({
    title: chalk.green(`Installing project dependencies...`),
    task: () => {
      const projectname = upperCaseWordWithDashes(directory, true);
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
