import { sha1 } from 'react-native-sha1';

export async function sha1Hash(data: string): Promise<string> {
  return sha1(data);
}