import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import { index, readme, packageJSON } from "../json";

export function checkCurrentDirectory(name: string) {
  const curDir = getCurrentDirectory(name);
  createDirectory(curDir);
  return curDir;
}

export function createDirectory(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

export function getCurrentDirectory(name: string) {
  return path.resolve(process.cwd(), `./${name}`);
}

export function createIndex(directory: string) {
  const imports = index.imports.map(imp => imp + "\n").join("");
  const contents = index.content.map(content => "\n" + content).join("");
  fs.writeFileSync(getCurrentDirectory(directory) + "/index.ts", imports + contents);
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

export function removeGit() {
  const gitFolder = path.resolve(process.cwd(), ".git");
  shell.rm("-rf", gitFolder);
}

export function createReadMe(directory: string) {
  const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");
  const rawdata = fs.readFileSync(PACKAGE_JSON);
  const data = JSON.parse(rawdata.toString());

  const body = Object.keys(readme).map((key: string) => {
    if (key === "appName") {
      return `# ${directory}\n\n`;
    }

    if (key === "description") {
      return readme[key].replace("#cli-url", data.homepage.replace("#readme", "")).replace("#cli-version", data.version) + "\n\n";
    }

    if (key === "body") {
      return readme[key].map(el => el + "\n\n").join("");
    }

    return;
  });

  fs.writeFileSync(getCurrentDirectory(directory) + "/README.md", body.join(""));
}

export function createPackageJSON(appName: string) {
  const data = packageJSON;
  data.name = appName;
  data.description = data.description.replace("#name", appName.replace(/^\w/, c => c.toUpperCase()));
  fs.writeFileSync(getCurrentDirectory(appName) + "/package.json", JSON.stringify(data, null, 2));
}
