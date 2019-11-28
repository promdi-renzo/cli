const index = {
  imports: ['import { AppModule } from ". / app.module ";', 'import { MayaJS } from "@mayajs/core";'],
  content: ["const server = new MayaJS(AppModule);", 'const prod = process.env.NODE_ENV === "production";', "server.prodMode(prod).start();"],
};

export { index };
