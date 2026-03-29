import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const children = [];
let shuttingDown = false;

function log(prefix, message) {
  process.stdout.write(`[${prefix}] ${message}\n`);
}

function spawnService(name, command, args, cwd) {
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", buildWindowsCommand(command, args)], {
          cwd,
          stdio: "inherit",
          shell: false,
        })
      : spawn(command, args, {
          cwd,
          stdio: "inherit",
          shell: false,
        });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    log(name, `stopped unexpectedly with ${reason}`);
    shutdown(code ?? 1);
  });

  child.on("error", (error) => {
    if (shuttingDown) {
      return;
    }

    log(name, `failed to start: ${error.message}`);
    shutdown(1);
  });

  children.push(child);
  return child;
}

function buildWindowsCommand(command, args) {
  const escape = (value) => {
    if (!/[ \t"]/.test(value)) {
      return value;
    }
    return `"${value.replace(/"/g, '\\"')}"`;
  };

  return [command, ...args].map(escape).join(" ");
}

function stopProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
      shell: false,
    });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // Process already exited.
  }
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    stopProcessTree(child.pid);
  }
  process.exit(code);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = process.platform === "win32" ? "python" : "python3";

log("dev", "Starting backend on http://127.0.0.1:8000");
spawnService(
  "backend",
  pythonCommand,
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
  path.join(repoRoot, "backend")
);

log("dev", "Starting frontend on http://127.0.0.1:5173");
spawnService(
  "frontend",
  npmCommand,
  ["run", "dev", "--prefix", "frontend", "--", "--host", "127.0.0.1", "--port", "5173"],
  repoRoot
);

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
