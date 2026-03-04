import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(scriptDir, "..");
const apiDir = resolve(webDir, "..", "api");
const pythonExe = resolve(apiDir, ".venv", "Scripts", "python.exe");
const schemaPath = resolve(webDir, "openapi.local.json");
const outputPath = resolve(webDir, "src", "lib", "api", "generated.ts");
const generatorPath = resolve(webDir, "node_modules", "openapi-typescript", "bin", "cli.js");

mkdirSync(dirname(outputPath), { recursive: true });

const schema = execFileSync(
  pythonExe,
  ["-c", "import json; from app.main import app; print(json.dumps(app.openapi()))"],
  { cwd: apiDir, encoding: "utf8" },
);

writeFileSync(schemaPath, schema, "utf8");
execFileSync(process.execPath, [generatorPath, schemaPath, "--output", outputPath], {
  cwd: webDir,
  stdio: "inherit",
});
rmSync(schemaPath, { force: true });
