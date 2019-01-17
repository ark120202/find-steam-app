import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';

const pathIfExists = async (name: string) => ((await fs.pathExists(name)) ? name : undefined);
const getRegExePath = () =>
  process.platform === 'win32' && process.env.windir != null
    ? path.join(process.env.windir, 'System32', 'reg.exe')
    : 'REG';

const REG_TREE_PATH = 'HKCU\\Software\\Valve\\Steam';
const REG_KEY_NOT_FOUND = 'The system was unable to find the specified registry key or value';
async function windows() {
  let programFiles = process.env['ProgramFiles(x86)'];
  if (programFiles == null) programFiles = process.env.ProgramFiles;
  if (programFiles != null && (await fs.pathExists(`${programFiles}/Steam/Steam.exe`))) {
    return `${programFiles}/Steam`;
  }

  try {
    const output = await execa.stdout(
      getRegExePath(),
      ['QUERY', REG_TREE_PATH, '/v', 'SteamPath'],
      { cwd: undefined },
    );
    const matches = output.match(/SteamPath\s+[A-Z_]+\s+(.+)/);
    if (!matches || !matches[1]) throw new Error(`Unexpected output:\n${output.trim()}`);

    return pathIfExists(matches[1]);
  } catch (err) {
    if (!err.message.includes(REG_KEY_NOT_FOUND)) {
      throw err;
    }
  }
}

/**
 * Searches for Steam.
 *
 * @returns Location of Steam. `undefined` if Steam wasn't found.
 */
export async function findSteam() {
  switch (process.platform) {
    case 'win32':
      return windows();
    case 'linux':
      return pathIfExists(`${process.env.HOME}/.local/share/Steam`);
    case 'darwin':
      return pathIfExists(`${process.env.HOME}/Library/Application Support/Steam`);
    default:
      throw new Error(`Steam finding isn't implemented for ${process.platform}`);
  }
}
