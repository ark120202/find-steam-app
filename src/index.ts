import fs from 'fs-extra';
import pFilter from 'p-filter';
import path from 'path';
import { loadSteamLibraries } from './libraries';
import { AppManifest, hasManifest, readManifest } from './manifest';
import { findSteam } from './steam';

export { AppManifest, findSteam };

export class SteamNotFoundError extends Error {
  public constructor() {
    super('Steam installation directory not found');
    this.name = 'SteamNotFoundError';
  }
}

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibraries() {
  const steam = await findSteam();
  if (steam == null) throw new SteamNotFoundError();

  return loadSteamLibraries(steam);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Information about installed application.
 */
export async function findSteamAppManifest(appId: number) {
  const libs = await findSteamLibraries();
  const [library] = await pFilter(libs, lib => hasManifest(lib, appId));
  if (library == null) return;

  return readManifest(library, appId);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamAppByName(name: string) {
  const libs = await findSteamLibraries();
  const [library] = await pFilter(libs, lib => fs.pathExists(path.join(lib, 'common', name)));
  if (library == null) return;

  return path.join(library, 'common', name);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamAppById(appId: number) {
  const libs = await findSteamLibraries();
  const [library] = await pFilter(libs, lib => hasManifest(lib, appId));
  if (library == null) return;

  const manifest = await readManifest(library, appId);
  return path.join(library, 'common', manifest.installdir);
}
