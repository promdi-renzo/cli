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
  data.description = data.description.replace("#name", upperCaseFirstLetter(appName));
  fs.writeFileSync(getCurrentDirectory(appName) + "/package.json", JSON.stringify(data, null, 2));
}

export function createGitIgnore(appName: string) {
  const FILE_TO_COPY = getCurrentDirectory("src/files") + "/.gitignore";
  const DESTINATION = getCurrentDirectory(appName) + "/.gitignore";
  fs.copyFileSync(FILE_TO_COPY, DESTINATION);
}

export function createTsConfig(appName: string) {
  fs.writeFileSync(getCurrentDirectory(appName) + "/tsconfig.json", JSON.stringify(tsConfig, null, 2));
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
  fs.writeFileSync(workingDirectory + "/app.module.ts", data);
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

  fs.writeFileSync(workingDirectory + "/app.routing.module.ts", data);
}

export function createEnvironment(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/environments");
  const data = ["export const environment = {", " production: false,", "};"].join("\n");
  fs.writeFileSync(workingDirectory + "/index.ts", data);
}

export function createController(appName: any) {
  const workingDirectory = checkCurrentDirectory(appName + "/src/controllers");
  createControllerTs(workingDirectory, "sample");
  createModelTs(workingDirectory, "sample");
  createServiceTs(workingDirectory, "sample");
}

export function createControllerTs(directory: string, name: string) {
  const servicesName = upperCaseFirstLetter(name) + "Services";
  const imports = controller.imports
    .join("\n")
    .replace("#services", servicesName)
    .replace(/#name/g, name);
  const decorator =
    "@Controller(" +
    JSON.stringify(controller["decorator"], null, 2)
      .replace(/\"model\"/g, "model")
      .replace(/\"route\"/g, "route")
      .replace(/#name/g, name) +
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
    .join("\n")
    .replace(/#name/g, upperCaseFirstLetter(name))
    .replace(/#services/g, servicesName);

  const data = imports + "\n\n" + decorator + "\n" + body;
  fs.writeFileSync(path.resolve(directory + `/${name}.controller.ts`), data);
}

export function createModelTs(directory: string, name: string) {
  const imports = model.imports.join("\n");
  const schema = "const schema = new Schema(" + JSON.stringify(model["schema"], null, 2) + ")";
  const body = model.body.join("\n").replace("#name", upperCaseFirstLetter(name));
  const data = imports + "\n\n" + schema + "\n\n" + body;
  fs.writeFileSync(path.resolve(directory + `/${name}.model.ts`), data);
}

export function createServiceTs(directory: string, name: string) {
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
    .join("\n")
    .replace("#name", name)
    .replace("#services", upperCaseFirstLetter(name) + "Services");
  const data = imports + "\n\n" + body;

  fs.writeFileSync(path.resolve(directory + `/${name}.service.ts`), data);
}

function upperCaseFirstLetter(word: string) {
  return word.replace(/^\w/, c => c.toUpperCase());
}
