import { App } from "@mayajs/core";
import { Mongo } from "@mayajs/mongo";
import { routes } from "./app.routing.module";

@App({
  cors: true,
  logs: "dev",
  port: 3333,
  database: Mongo({
    connectionString: "your-connection-string-here",
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false
    }
  }),
  routes
})
export class AppModule {}