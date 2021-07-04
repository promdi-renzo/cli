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

export { updateTemplateFolder, cloneTemplateRepo, updateTemplateList };
