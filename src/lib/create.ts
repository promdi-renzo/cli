import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import { index } from "../json";

export function createIndex() {
  const imports = index.imports.map(imp => imp + "\n").join("");
  const contents = index.content.map(content => "\n" + content).join("");
  fs.writeFileSync("./sample/index.ts", imports + contents);
}

export function gitClone(dir: string) {
  const sample = `git clone https://github.com/mayajs/sample.git ${dir}`;
  if (shell.exec(sample).code !== 0) {
    throw new Error("Error: Git clone failed");
  }
  shell.cd(dir);
}

export function installDependency() {
  if (shell.exec("npm i").code !== 0) {
    throw new Error("Error: npm install failed");
  }
}

export function updateJson(dir: string) {
  try {
    const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");
    const rawdata = fs.readFileSync(PACKAGE_JSON);
    const data = JSON.parse(rawdata.toString());
    data.name = dir;
    data.author = "";
    data.keywords = ["mayajs"];
    data.version = "1.0.0";
    delete data.bugs;
    delete data.homepage;
    delete data.repository;
    const NEW_DATA = JSON.stringify(data);
    fs.writeFileSync(PACKAGE_JSON, NEW_DATA);
  } catch (error) {
    const PROJECT_DIR = path.resolve(process.cwd(), `../${dir}`);
    fs.unlinkSync(PROJECT_DIR);
  }
}

export function removeGit() {
  const gitFolder = path.resolve(process.cwd(), ".git");
  shell.rm("-rf", gitFolder);
}
