import { getContentsUTF8FromDirname, upperCaseWordWithDashes } from "./utils";
import * as shell from "shelljs";
import chalk from "chalk";
import https from "https";
import path from "path";
import fs from "fs";

const getTemplateList = () => {
  if (!fs.existsSync(templatesFolderDir)) return [];

  const templateJSON = path.resolve(templatesFolderDir, "./templates.json");
  const templates = JSON.parse(getContentsUTF8FromDirname(templateJSON));
  return Object.keys(templates);
};

const updateTemplateFolder = async (ctx: any, task: any) => {
  const temp = `${ctx.templatesFolderDir}/temp`;
  shell.exec(`git clone https://github.com/mayajs/templates.git ${temp}`, { silent: true });
  shell.cp("-Rf", `${temp}/common`, `${ctx.templatesFolderDir}/common`);
  shell.rm("-rf", temp);
};

const cloneTemplateRepo = async (ctx: any, task: any) => {
  shell.rm("-rf", ctx.templatesFolderDir);
  shell.exec(`git clone https://github.com/mayajs/templates.git ${ctx.templatesFolderDir}`, { silent: true });
  shell.rm("-rf", [`${ctx.templatesFolderDir}/.git`, `${ctx.templatesFolderDir}/README.md`]);
};

const updateTemplateList = async (ctx: any, task: any) => {
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
  const templateJSON = path.resolve(ctx.templatesFolderDir, "./templates.json");
  fs.writeFileSync(`${ctx.templatesFolderDir}/templates.json`, await promise);
  ctx["DATA_JSON"] = getContentsUTF8FromDirname(templateJSON);
  ctx["promise"] = promise;
};

const searchTemplates = async (ctx: any, task: any) => {
  let selectedVersion = { version: "", url: "" };
  const DATA_JSON = JSON.parse(ctx.DATA_JSON);
  Object.keys(DATA_JSON).some((key) => {
    if (key === ctx?.template) {
      const versions: { version: string; cli: string; url: string }[] = DATA_JSON[key].versions;
      return versions.some((version) => {
        const split = version.cli.split(".");
        const projectVersion = ctx.PROJECT_DATA_JSON.version.split(".");
        const isMatched = +split[0] >= +projectVersion[0] && +split[1] >= +projectVersion[1];
        if (isMatched) selectedVersion = version;
        ctx["selectedVersion"] = selectedVersion;
        return !isMatched;
      });
    }
    return false;
  });

  if (ctx.selectedVersion === "") {
    const data = await ctx.promise;
    fs.writeFileSync(`${ctx.templatesFolderDir}/templates.json`, data);
    throw new Error("Template name doesn't exist.");
  }
};

const cloneSelectedTemplate = async (ctx: any, task: any) => {
  ctx.templateDir = `${ctx.templatesFolderDir}/${ctx?.template}/${ctx.selectedVersion.version}`;
  if (fs.existsSync(ctx.templateDir)) {
    task.skip();
    return;
  }
  shell.exec(`git clone ${ctx.selectedVersion.url} ${ctx.templateDir}`, { silent: true });
  shell.rm("-rf", [`${ctx.templateDir}/.git`]);
};

const prepareProject = async (ctx: any, task: any) => {
  const projectDir = path.resolve(process.cwd(), ctx.directory);
  const projectExist = fs.existsSync(projectDir);

  if (projectExist) shell.rm("-rf", projectDir);
  shell.cp("-Rf", ctx.templateDir, projectDir);
  ctx["projectDir"] = projectDir;
};

const installDependency = async (ctx: any, task: any) => {
  const projectname = upperCaseWordWithDashes(ctx.directory, true);
  const readme = `${ctx.projectDir}/README.md`;
  const packageJson = `${ctx.projectDir}/package.json`;
  shell.sed("-i", /([\s|\"])(MayaJS)/g, "$1" + projectname + " $2", [readme, packageJson]);
  shell.sed("-i", /(version)/g, "$1 " + ctx.PROJECT_DATA_JSON.version, readme);
  shell.sed("-i", /\"mayajs\"/, `"${ctx.directory.toLowerCase()}"`, packageJson);
  shell.cd(ctx.projectDir);
  shell.exec("npm i --error");
};

const templateTasks = (options?: any) => {
  const hasTemplateArgs = () => options?.template;
  return [
    { title: chalk.green(`Updating template folder...`), task: updateTemplateFolder, enabled: commonExist },
    { title: chalk.green(`Downloading files for creating your MayaJS project...`), task: cloneTemplateRepo, enabled: templateExist },
    { title: chalk.green(`Updating template list...`), task: updateTemplateList, enabled: hasTemplateArgs },
    { title: chalk.green(`Searching template list...`), task: searchTemplates, enabled: hasTemplateArgs },
    { title: chalk.green(`Downloading template files for your project...`), task: cloneSelectedTemplate, enabled: hasTemplateArgs },
    { title: chalk.green(`Preparing project files and directories...`), task: prepareProject },
    { title: chalk.green(`Installing project dependencies...`), task: installDependency },
  ];
};

const templatesFolderDir = path.resolve(`${__dirname}`, "../templates");
const commonDir = `${templatesFolderDir}/common`;
const templateDir = `${templatesFolderDir}/default`;
const templateExist = () => !fs.existsSync(templatesFolderDir) || !fs.existsSync(templateDir);
const commonExist = () => !fs.existsSync(commonDir);

export { templateDir, templatesFolderDir, templateTasks, getTemplateList };
