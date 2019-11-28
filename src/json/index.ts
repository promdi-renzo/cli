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

export { index, readme };
