const index = {
  imports: ['import { AppModule } from ". / app.module ";', 'import { MayaJS } from "@mayajs/core";'],
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
    start: "nodemon --exec ts-node src/index.ts",
  },
  author: "",
  keywords: ["mayajs"],
  dependencies: {
    "@mayajs/core": "0.3.0",
    "@mayajs/mongo": "0.1.0",
  },
  devDependencies: {
    "@types/dotenv": "^6.1.1",
    "@types/express": "^4.17.0",
    "@types/mongoose": "^5.5.13",
    "@types/mongoose-paginate": "^5.0.6",
    "@types/node": "^12.7.1",
    "ts-node": "^8.4.1",
    nodemon: "^1.19.3",
    typescript: "^3.5.3",
  },
};

export { index, readme, packageJSON };
