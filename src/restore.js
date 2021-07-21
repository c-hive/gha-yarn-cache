const core = require("@actions/core");
const exec = require("@actions/exec");
const md5File = require("md5-file");
const cache = require("@actions/cache");

async function uname() {
  let output = "";
  const options = {};
  options.listeners = {
    stdout: data => {
      output += data.toString();
    },
  };
  await exec.exec("uname", [], options);

  return output.trim();
}

async function yarnCache() {
  let output = "";
  const options = {};
  options.listeners = {
    stdout: data => {
      output += data.toString();
    },
  };

  // Default to the Yarn v2 command for getting the cache folder
  // If the result is not "undefined" we are on Yarn v2
  await exec.exec("yarn config get cacheFolder", [], options);

  if (output.trim() === "undefined") {
    // Yarn v2 didn't work, trying the equivalent Yarn v1 command
    output = "";
    await exec.exec("yarn cache dir", [], options);
  }

  return output.trim();
}

async function run() {
  const os = await uname();
  const cachePath = await yarnCache();
  core.saveState("YARN_CACHE_PATH", cachePath);

  const directory = core.getInput("directory");
  const hash = md5File.sync(`${directory}/yarn.lock`);

  const primaryKey = `${os}-yarn-cache-${hash}`;
  const restoreKey = `${os}-yarn-cache-`;
  core.saveState("YARN_CACHE_KEY", primaryKey);
  core.info(`Cache keys: ${[primaryKey, restoreKey].join(", ")}`);

  const cacheKey = await cache.restoreCache([cachePath], primaryKey, [
    restoreKey,
  ]);

  if (!cacheKey) {
    core.info("Cache not found");
    return;
  }

  core.saveState("YARN_CACHE_RESULT", cacheKey);
  const isExactKeyMatch = primaryKey === cacheKey;
  core.setOutput("cache-hit", isExactKeyMatch.toString());

  core.info(`Cache restored from key: ${cacheKey}`);
}

run().catch(err => {
  core.setFailed(err.toString());
});
