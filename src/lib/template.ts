import { getContentsUTF8FromDirname } from "./utils";
import * as shell from "shelljs";
import https from "https";
import path from "path";
import fs from "fs";

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

export { updateTemplateFolder, cloneTemplateRepo, updateTemplateList, searchTemplates, cloneSelectedTemplate };
