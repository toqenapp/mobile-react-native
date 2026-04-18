const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const version = process.argv[2];

if (!version) {
  console.error("Version is required. Example: pnpm release:android 1.0.11");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Version must match format: X.Y.Z");
  process.exit(1);
}

const tag = `v-android-${version}`;
const packageJsonPath = path.join(process.cwd(), "package.json");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (pkg.version === version) {
    console.log(`ℹ️ Version already ${version}`);
  } else {
    pkg.version = version;
    fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

    run("git add package.json");
    run(`git commit -m "release(android): ${version}"`);
    run("git push");
  }

  run(`git tag ${tag}`);
  run(`git push origin ${tag}`);

  console.log(`✅ Released ${tag}`);
} catch (e) {
  console.error("❌ Release failed", e);
  process.exit(1);
}
