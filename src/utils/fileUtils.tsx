import * as fs from 'react-native-fs';

/**
 * Get the basename of a filesystem path
 */
export function getBaseName(path: string) {
  return path.substring(path.lastIndexOf('/') + 1, path.length);
}

/**
 * Get the basename of a Content URI path
 */
export function getUriBaseName(uri: string) {
  return getBaseName(decodeURIComponent(uri));
  // const statResult = await fs.stat(uri);
  // return statResult.name;
}