import * as shell from "shelljs";
import * as path from "path";

export function build(options: { rootDir: string; project: string; outDir: string }) {
  const { rootDir, outDir, project } = options;
  const command = `tsc --rootDir ${path.resolve(rootDir)} --outDir ${path.resolve(outDir)} --project ${path.resolve(project)} --strict true`;
  const cmd = shell.exec(command);
  if (cmd.code !== 0) {
    throw new Error("Error: Build failed");
  }
}

export function cleanOutDir(options: { outDir: string }) {
  const cmd = shell.rm("-rf", options.outDir);
  if (cmd.code !== 0) {
    throw new Error("Error:Can't removed dist folder");
  }
}
