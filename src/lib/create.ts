import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import { index, readme, packageJSON, tsConfig, appModule, routing, controller, model, services } from "../json";

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
  const imports = index.imports.join("\n") + "\n\n";
  const contents = index.content.join("\n");
  fs.writeFileSync(path.resolve(workingDirectory + "/index.ts"), imports + contents);
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

  fs.writeFileSync(path.resolve(getCurrentDirectory(directory) + "/README.md"), body.join(""));
}

export function createPackageJSON(appName: string) {
  const data = packageJSON;
  data.name = appName;
  data.description = data.description.replace("#name", upperCaseFirstLetter(appName));
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/package.json"), JSON.stringify(data, null, 2));
}

export function createGitIgnore(appName: string) {
  const FILE_TO_COPY = path.resolve(__dirname, "../src/files/.gitignore");
  const DESTINATION = getCurrentDirectory(appName) + "/.gitignore";
  fs.copyFileSync(FILE_TO_COPY, DESTINATION);
}

export function createTsConfig(appName: string) {
  fs.writeFileSync(path.resolve(getCurrentDirectory(appName) + "/tsconfig.json"), JSON.stringify(tsConfig, null, 2));
}

export function createAppModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const imports = appModule.imports.map(val => val + "\n").join("") + "\n";
  const { cors, logs, database: db, port } = appModule;
  const decorator = `@App(${JSON.stringify({ cors, logs, port, database: db }, null, 2)})\n`
    .replace(/\"/g, "")
    .replace("#url", '"your-connection-string-here"')
    .replace("database: ", "database: Mongo(")
    .replace("}\n})", "}),\n  routes\n})");

  const data = imports + decorator + "export class AppModule {}";
  fs.writeFileSync(path.resolve(workingDirectory + "/app.module.ts"), data);
}

export function createAppRoutingModule(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src");
  const imports = routing.imports;
  delete routing.imports;

  const body = Object.keys(routing)
    .map(key => {
      if (key === "controllers") {
        return `${key} : [SampleController]`;
      }

      if (key === "middlewares") {
        return `${key} : []`;
      }

      return `${key} : ""`;
    })
    .join(",\n  ");
  const routes = `\n\nexport const routes = [\n  ${body}\n];`;
  const data = imports + routes;

  fs.writeFileSync(path.resolve(workingDirectory + "/app.routing.module.ts"), data);
}

export function createEnvironment(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/environments");
  const data = ["export const environment = {", " production: false,", "};"].join("\n");
  fs.writeFileSync(workingDirectory + "/index.ts", data);
}

export function createController(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/controllers");
  createControllerTs({ directory: workingDirectory, name: "sample" });
  createModelTs({ directory: workingDirectory, name: "sample" });
  createServiceTs({ directory: workingDirectory, name: "sample" });
}

export function createControllerTs(object: { directory: string; name: string }) {
  const { directory, name } = object;
  const imports = controller.imports.join("\n");
  const decorator =
    "@Controller(" +
    JSON.stringify(controller["decorator"], null, 2)
      .replace(/\"model\"/g, "model")
      .replace(/\"route\"/g, "route") +
    ")";

  const body = controller["body"]
    .map((val: string, index: number) => {
      if (index <= 1) {
        val += "\n";
      }

      if (index >= 1 && index < 5) {
        const spaces = "  ";
        val = (index === 4 ? spaces + spaces : spaces) + val;
      }

      return val;
    })
    .join("\n");

  const data = imports + "\n\n" + decorator + "\n" + body;
  const updatedSerices = updateServicesName(data, name);
  const updatedController = updateControllersName(updatedSerices, name);
  const updatedModel = updateModelsName(updatedController, name);
  const updatedNames = updateNames(updatedModel, name);
  fs.writeFileSync(path.resolve(directory + `/${name}.controller.ts`), updatedNames);
}

export function createModelTs(object: { directory: string; name: string }) {
  const { directory, name } = object;
  const imports = model.imports.join("\n");
  const schema = "const schema = new Schema(" + JSON.stringify(model["schema"], null, 2) + ")";
  const body = model.body.join("\n");
  const data = imports + "\n\n" + schema + "\n\n" + body;
  fs.writeFileSync(path.resolve(directory + `/${name}.model.ts`), updateNames(data, name));
}

export function createServiceTs(object: { directory: string; name: string }) {
  const { directory, name } = object;
  const imports = services.imports.join("\n");
  const body = services.body
    .map((value: string, index: number) => {
      const spaces = "  ";
      if (index >= 2 && index <= 5) {
        value = (index === 4 ? spaces + spaces : spaces) + value;
        value = value + (index === 2 ? "\n" : "");
      }

      return value;
    })
    .join("\n");
  const data = imports + "\n\n" + body;
  const updatedSerices = updateServicesName(data, name);
  const updatedNames = updateNames(updatedSerices, name);

  fs.writeFileSync(path.resolve(directory + `/${name}.service.ts`), updatedNames);
}

function upperCaseFirstLetter(word: string) {
  return word.replace(/^\w/, c => c.toUpperCase());
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
