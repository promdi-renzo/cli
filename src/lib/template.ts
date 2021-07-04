import * as shell from "shelljs";

const updateTemplateFolder = async (ctx: any, task: any) => {
  const temp = `${ctx.templatesFolderDir}/temp`;
  shell.exec(`git clone https://github.com/mayajs/templates.git ${temp}`, { silent: true });
  shell.cp("-Rf", `${temp}/common`, `${ctx.templatesFolderDir}/common`);
  shell.rm("-rf", temp);
};

export { updateTemplateFolder };
