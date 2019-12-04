const index = {
  imports: ['import { AppModule } from "./app.module";', 'import { MayaJS } from "@mayajs/core";'],
  content: ["const server = new MayaJS(AppModule);", 'const prod = process.env.NODE_ENV === "production";', "server.prodMode(prod).start();"],
};

const readme = {
  appName: "#appName",
  description: `This project was created with [MayaJS CLI](#cli-url) version #cli-version`,
  body: [
    "## Development server",
    "Run `maya serve` to run the server. Navigate to `http://localhost:3333`. Hot reload will watch for file changes and restart the server.",
    "## Code scaffolding",
    "Run `maya create <service|controller|model> <name|directory>` to create a new component.",
    "## Build",
    "Run `maya build` to build the project. Use the `--prod` flag for a production build. The build files will be created in the `dist/` directory.",
  ],
};

const packageJSON = {
  name: "",
  version: "1.0.0",
  description: "#name MayaJS Project",
  main: "index.js",
  scripts: {
    maya: "maya",
    start: "maya serve",
  },
  author: "",
  keywords: ["mayajs"],
  dependencies: {
    "@mayajs/common": "^0.3.0",
    "@mayajs/core": "0.3.2",
    "@mayajs/mongo": "0.2.0",
  },
  devDependencies: {
    "@types/express": "^4.17.0",
    "@types/mongoose": "^5.5.13",
    "@types/mongoose-paginate": "^5.0.6",
    "@types/node": "^12.7.1",
    "ts-node": "^8.4.1",
    nodemon: "^1.19.3",
    typescript: "^3.5.3",
  },
};

const tsConfig = {
  compilerOptions: {
    target: "ES6",
    module: "commonjs",
    lib: ["es5", "es2015", "es2016", "es2017", "esnext"],
    outDir: "./dist",
    rootDir: "./src",
    strict: true,
    moduleResolution: "node",
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  },
};

const appModule = {
  imports: ['import { App } from "@mayajs/core";', 'import { Mongo } from "@mayajs/mongo";', 'import { routes } from "./app.routing.module";'],
  cors: true,
  logs: "dev",
  database: {
    connectionString: "#url",
    options: { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false },
  },
  port: 3333,
};

const routing = {
  imports: 'import { SampleController } from "./controllers/sample/sample.controller";',
  controllers: [],
  middlewares: [],
  path: "",
};

const controller = {
  imports: [
    'import { Get, Patch, Post, Delete, Put } from "@mayajs/common";',
    'import { Request, Response, NextFunction } from "express";',
    'import { #services } from "./#name.service"',
    'import { Controller} from "@mayajs/core";',
  ],
  decorator: {
    model: "./#model",
    route: "/#name",
  },
  body: [
    "export class #controller {",
    "constructor(private services: #services) {}",
    '@Get({ path: "/", middlewares: [] })',
    "root(req: Request, res: Response, next: NextFunction): void {",
    "res.send(this.services.hello());\n  }",
    "}",
  ],
};

export { index, readme, packageJSON, tsConfig, appModule, routing, controller };
