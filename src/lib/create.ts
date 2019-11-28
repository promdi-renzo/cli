import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import { index, readme } from "../json";

export function checkCurrentDirectory(name: string) {
  createDirectory(path.resolve(process.cwd(), `./${name}`));
}

export function createDirectory(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

export function createIndex(directory: string) {
  const imports = index.imports.map(imp => imp + "\n").join("");
  const contents = index.content.map(content => "\n" + content).join("");
  const curDir = path.resolve(process.cwd(), `./${directory}`);

  if (!fs.existsSync(curDir)) {
    fs.mkdirSync(curDir);
  }

  fs.writeFileSync(curDir + "/index.ts", imports + contents);
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

export function createReadMe(directory: string) {
  const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");
  const rawdata = fs.readFileSync(PACKAGE_JSON);
  const data = JSON.parse(rawdata.toString());
  const curDir = path.resolve(process.cwd(), `./${directory}/README.md`);

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

  fs.writeFileSync(curDir, body.join(""));
}
