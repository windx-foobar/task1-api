const fsp = require('node:fs/promises');
const { resolve } = require('node:path');
const fb = require('fast-glob');

async function loadPackage(dir) {
  const pkgPath = resolve(dir, 'package.json');
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'));
  const save = () => fsp.writeFile(pkgPath, JSON.stringify(data, null, 2) + '\n');

  const updateDeps = (reviver) => {
    for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      if (!data[type]) {
        continue;
      }
      for (const e of Object.entries(data[type])) {
        const dep = { name: e[0], range: e[1], type };
        delete data[type][dep.name];
        const updated = reviver(dep) || dep;
        data[updated.type] = data[updated.type] || {};
        data[updated.type][updated.name] = updated.range;
      }
    }
  };

  return {
    dir,
    data,
    save,
    updateDeps
  };
}

async function loadWorkspace(dir) {
  const workspacePkg = await loadPackage(dir);
  const pkgDirs = await fb(['packages/*'], { onlyDirectories: true });
  pkgDirs.sort();
  pkgDirs.push('api');

  const packages = [];

  for (const pkgDir of [...pkgDirs, 'admin', 'site', 'frontend']) {
    const pkg = await loadPackage(pkgDir);
    if (!pkg.data.name) {
      continue;
    }
    packages.push(pkg);
  }

  const find = (name) => {
    const pkg = packages.find((pkg) => pkg.data.name === name);
    if (!pkg) {
      throw new Error('Workspace package not found: ' + name);
    }
    return pkg;
  };

  const rename = (from, to) => {
    find(from).data._name = find(from).data.name;
    find(from).data.name = to;
    for (const pkg of packages) {
      pkg.updateDeps((dep) => {
        if (dep.name === from && !dep.range.startsWith('npm:')) {
          dep.range = 'npm:' + to + '@' + dep.range;
        }
      });
    }
  };

  const setVersion = (name, newVersion) => {
    find(name).data.version = newVersion;
    for (const pkg of packages) {
      pkg.updateDeps((dep) => {
        if (dep.name === name) {
          dep.range = newVersion;
        }
      });
    }
  };

  const save = () => Promise.all(packages.map((pkg) => pkg.save()));

  return {
    dir,
    workspacePkg,
    packages,
    save,
    find,
    rename,
    setVersion
  };
}

module.exports = { loadWorkspace };
