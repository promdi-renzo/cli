import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import { getContentsUTF8FromDirname, upperCaseWordWithDashes } from "./utils";

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

export function createIndex(appName: string) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const CONTENTS = getContentsUTF8FromDirname("../files/index");
  fs.writeFileSync(path.resolve(workingDirectory + "/index.ts"), CONTENTS);
}

export function gitInit(directory: string) {
  shell.cd(directory);
  const sample = `git init`;
  if (shell.exec(sample).code !== 0) {
    throw new Error("Error: Git clone failed");
  }
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
  const PACKAGE_DATA = getContentsUTF8FromDirname("../package.json");
  const PACKAGE_DATA_JSON = JSON.parse(PACKAGE_DATA);
  const CONTENTS = getContentsUTF8FromDirname("../files/README");
  const UPDATED_CONTENTS = CONTENTS.replace(/#cli-url/g, PACKAGE_DATA_JSON.homepage.replace(/#readme/g, "")).replace(
    /#cli-version/g,
    PACKAGE_DATA_JSON.version
  );
  const DATA = updateNames(UPDATED_CONTENTS, directory);
  fs.writeFileSync(path.resolve(getCurrentDirectory(directory) + "/README.md"), DATA);
}

export function createPackageJSON(appName: string) {
  const CONTENTS = getContentsUTF8FromDirname("../files/package");
  const DATA = updateNames(CONTENTS, appName);
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/package.json"), DATA);
}

export function createGitIgnore(appName: string) {
  const FILE_TO_COPY = path.resolve(__dirname, "../files/gitignore");
  const DESTINATION = getCurrentDirectory(appName) + "/.gitignore";
  fs.copyFileSync(FILE_TO_COPY, DESTINATION);
}

export function createTsConfig(appName: string) {
  const CONTENTS = getContentsUTF8FromDirname("../files/tsconfig");
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/tsconfig.json"), CONTENTS);
}

export function createAppModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const CONTENTS = getContentsUTF8FromDirname("../files/app.module");
  fs.writeFileSync(path.resolve(workingDirectory + "/app.module.ts"), CONTENTS);
}

export function createAppRoutingModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const CONTENTS = getContentsUTF8FromDirname("../files/routing");
  fs.writeFileSync(path.resolve(workingDirectory + "/app.routing.module.ts"), CONTENTS);
}

export function createEnvironment(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/environments");
  const data = ["export const environment = {", " production: false,", "};"].join("\n");
  fs.writeFileSync(workingDirectory + "/index.ts", data);
}

export function createDatabase(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/databases");
  const CONTENTS = getContentsUTF8FromDirname("../files/mongo");
  const UPDATED_MODEL_NAMES = CONTENTS.replace(/#model/g, "sample");
  fs.writeFileSync(workingDirectory + "/mongo.ts", UPDATED_MODEL_NAMES);
}

export function createAppController(appName: string) {
  const directory = checkCurrentDirectory(appName + "/src") + "/app";
  createController({ directory, name: "app", start: true });
}

export function createController(object: { directory: string; name: string; start?: boolean }) {
  const { directory, name, start } = object;
  const isApp = name === "app";
  const CONTENTS = getContentsUTF8FromDirname("../files/controller");
  const services = upperCaseWordWithDashes(name) + "Services";
  const updatedConstructor = CONTENTS.replace(/#constructor/g, !start ? `private services: ${services}` : "");
  const body = isApp ? CONTENTS.replace(/[\n|\r]\s+?constructor\(#constructor\) {}[\n|\r]{2,}/g, "\n") : updatedConstructor;
  const updatedServices = !start ? updateServicesImport(body, name) : body.replace(/#services/g, "");
  const updatedController = updateControllersName(updatedServices, name);
  const DATA = updateNames(updatedController, name);
  fs.writeFileSync(path.resolve(`${directory}.controller.ts`), DATA);
}

export function createModelTs(object: { directory: string; name: string; schema: string }) {
  const { directory, name, schema } = object;
  const schemas = ["mongo", "sql"];

  if (!schema) {
    throw new Error(`Schema is not defined!`);
  }

  if (!schemas.includes(schema)) {
    throw new Error(`Schema type of ${schema} is not valid!`);
  }

  const CONTENTS = getContentsUTF8FromDirname(`../files/model-${schema}`);
  const DATA = updateNames(CONTENTS, name);
  fs.writeFileSync(path.resolve(`${directory}.model.ts`), DATA);
}

export function createServiceTs(object: { directory: string; name: string; start?: boolean }) {
  const { directory, name, start = false } = object;
  const CONTENTS = getContentsUTF8FromDirname("../files/service");
  const updatedSerices = updateServicesName(CONTENTS, name);
  const DATA = updateNames(updatedSerices, name);
  fs.writeFileSync(path.resolve(`${directory}.service.ts`), DATA);
}

function updateServicesImport(word: string, name: string) {
  let importStatement = "";

  if (name !== "app") {
    const services = upperCaseWordWithDashes(name) + "Services";
    importStatement = `import { ${services} } from "./${name}.service"\n`;
  }

  return word.replace(/#services/g, importStatement);
}

function updateServicesName(word: string, name: string) {
  const services = upperCaseWordWithDashes(name) + "Services";
  return word.replace(/#services/g, services);
}

function updateControllersName(word: string, name: string) {
  const controller = upperCaseWordWithDashes(name) + "Controller";
  return word.replace(/#controller/g, controller);
}

function updateNames(word: string, name: string) {
  return word.replace(/#name/g, name).replace(/#Name/g, upperCaseWordWithDashes(name));
}
