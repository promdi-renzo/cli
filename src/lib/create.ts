import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";

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
  const FILE_PATH = path.resolve(__dirname, "../files/index");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
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
  const PACKAGE_JSON = path.resolve(__dirname, "../package.json");
  const PACKAGE_DATA = fs.readFileSync(PACKAGE_JSON, "utf8");
  const PACKAGE_DATA_JSON = JSON.parse(PACKAGE_DATA);
  const FILE_PATH = path.resolve(__dirname, "../files/README");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  const UPDATED_CONTENTS = CONTENTS.replace(/#cli-url/g, PACKAGE_DATA_JSON.homepage.replace(/#readme/g, "")).replace(
    /#cli-version/g,
    PACKAGE_DATA_JSON.version
  );
  const DATA = updateNames(UPDATED_CONTENTS, directory);
  fs.writeFileSync(path.resolve(getCurrentDirectory(directory) + "/README.md"), DATA);
}

export function createPackageJSON(appName: string) {
  const FILE_PATH = path.resolve(__dirname, "../files/package");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  const DATA = updateNames(CONTENTS, appName);
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/package.json"), DATA);
}

export function createGitIgnore(appName: string) {
  const FILE_TO_COPY = path.resolve(__dirname, "../files/gitignore");
  const DESTINATION = getCurrentDirectory(appName) + "/.gitignore";
  fs.copyFileSync(FILE_TO_COPY, DESTINATION);
}

export function createTsConfig(appName: string) {
  const FILE_PATH = path.resolve(__dirname, "../files/tsconfig");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/tsconfig.json"), CONTENTS);
}

export function createAppModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const FILE_PATH = path.resolve(__dirname, "../files/app.module");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  fs.writeFileSync(path.resolve(workingDirectory + "/app.module.ts"), CONTENTS);
}

export function createAppRoutingModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const FILE_PATH = path.resolve(__dirname, "../files/routing");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  fs.writeFileSync(path.resolve(workingDirectory + "/app.routing.module.ts"), CONTENTS);
}

export function createEnvironment(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/environments");
  const data = ["export const environment = {", " production: false,", "};"].join("\n");
  fs.writeFileSync(workingDirectory + "/index.ts", data);
}

export function createController(appName: any) {
  checkCurrentDirectory(appName + "/src/controllers");
  const workingDirectory = checkCurrentDirectory(appName + "/src/controllers/sample");
  createControllerTs({ directory: workingDirectory, name: "sample", start: true });
  createModelTs({ directory: workingDirectory, name: "sample" });
  createServiceTs({ directory: workingDirectory, name: "sample", start: true });
}

export function createControllerTs(object: { directory: string; name: string; start?: boolean }) {
  const { directory, name, start } = object;
  const FILE_PATH = path.resolve(__dirname, "../files/controller");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  const services = upperCaseFirstLetter(name) + "Services";
  const updatedConstructor = CONTENTS.replace(/#constructor/g, start ? `private services: ${services}` : "");
  const methodData = [
    '\n  @Get({ path: "/", middlewares: [] })\n  ',
    "  root(req: Request, res: Response, next: NextFunction): void {\n  ",
    "  res.send(this.services.hello());\n  }",
  ].join("");
  const updatedMethod = updatedConstructor.replace(/#method/g, start ? methodData : "");
  const updatedServices = start ? updateServicesImport(updatedMethod, name) : updatedMethod.replace(/#services/g, "");
  const updatedController = updateControllersName(updatedServices, name);
  const updatedModel = updateModelsName(updatedController, name);
  const DATA = updateNames(updatedModel, name);
  fs.writeFileSync(path.resolve(directory + `/${name}.controller.ts`), DATA);
}

export function createModelTs(object: { directory: string; name: string }) {
  const { directory, name } = object;
  const FILE_PATH = path.resolve(__dirname, "../files/model");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  const DATA = updateNames(CONTENTS, name);
  fs.writeFileSync(path.resolve(directory + `/${name}.model.ts`), DATA);
}

export function createServiceTs(object: { directory: string; name: string; start?: boolean }) {
  const { directory, name, start = false } = object;
  const FILE_PATH = path.resolve(__dirname, "../files/service");
  const CONTENTS = fs.readFileSync(FILE_PATH, "utf8");
  const methodData = ["\nhello() {\n  ", '  return "Hello world!";\n  ', "}\n", "}"].join("");
  const updatedMethod = CONTENTS.replace(/#method/g, start ? methodData : "");
  const updatedSerices = updateServicesName(updatedMethod, name);
  const DATA = updateNames(updatedSerices, name);
  fs.writeFileSync(path.resolve(directory + `/${name}.service.ts`), DATA);
}

function upperCaseFirstLetter(word: string) {
  return word.replace(/^\w/, c => c.toUpperCase());
}

function updateServicesImport(word: string, name: string) {
  const services = upperCaseFirstLetter(name) + "Services";
  const importStatement = `import { ${services} } from "./${name}.service"`;
  return word.replace(/#services/g, importStatement);
}

function updateServicesName(word: string, name: string) {
  const services = upperCaseFirstLetter(name) + "Services";
  return word.replace(/#services/g, services);
}

function updateControllersName(word: string, name: string) {
  const controller = upperCaseFirstLetter(name) + "Controller";
  return word.replace(/#controller/g, controller);
}

function updateModelsName(word: string, name: string) {
  return word.replace(/#model/g, name + ".model");
}

function updateNames(word: string, name: string) {
  return word.replace(/#name/g, name).replace(/#Name/g, upperCaseFirstLetter(name));
}
