import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = fileURLToPath(new URL(".", import.meta.url));
const nodeModulesDirectory = join(scriptsDirectory, "node_modules");
const commanderPackagePath = join(
  nodeModulesDirectory,
  "commander",
  "package.json"
);
const installKeyPath = join(
  nodeModulesDirectory,
  ".poteto-mode-tools-install-key"
);

function assertSupportedBun(): void {
  const version = process.versions.bun;
  const parts = version?.split(".").map(Number) ?? [];
  const supported = parts.length >= 3 && parts.every(Number.isInteger) && (
    parts[0] > 1 ||
    (parts[0] === 1 && parts[1] > 3) ||
    (parts[0] === 1 && parts[1] === 3 && parts[2] >= 14)
  );
  if (!supported) {
    throw new Error(`pstack tooling requires Bun 1.3.14 or newer; found ${version ?? "another runtime"}`);
  }
}

function currentInstallKey(): string {
  return createHash("sha256")
    .update(readFileSync(join(scriptsDirectory, "package.json")))
    .update("\0")
    .update(readFileSync(join(scriptsDirectory, "bun.lock")))
    .digest("hex");
}

export function ensureDependenciesInstalled(): void {
  assertSupportedBun();
  const installKey = currentInstallKey();
  if (
    existsSync(commanderPackagePath) &&
    existsSync(installKeyPath) &&
    readFileSync(installKeyPath, "utf8").trim() === installKey
  ) {
    return;
  }

  const result = spawnSync(process.execPath, ["install", "--frozen-lockfile", "--ignore-scripts"], {
    cwd: scriptsDirectory,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(
      `bun install exited with status ${result.status ?? 1}`
    );
  }
  if (!existsSync(commanderPackagePath)) {
    throw new Error(
      "bun install completed without installing commander"
    );
  }

  writeFileSync(installKeyPath, `${installKey}\n`);

  const restarted = spawnSync(process.execPath, process.argv.slice(1), {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  process.exit(restarted.status ?? 1);
}
