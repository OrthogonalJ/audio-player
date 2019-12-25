import AsyncStorage from '@react-native-community/async-storage';
import { KeyError } from '../exceptions/keyError';

export class StorageService {
  static readonly KEY_PART_DELIMITER = '__';

  static async getItem(collection: string, key: string): Promise<any> {
    const storageKey = StorageService.getStorageKey(collection, key);
    const value = await AsyncStorage.getItem(storageKey);
    if (value === null) {
      throw new KeyError(`Key "${storageKey}" missing from persistent storage`);
    }
    console.log(`[StorageService$getItem] Value pre-JSON.parse`);
    console.log(value);
    return JSON.parse(value);
  }

  static async setItem(collection: string, key: string, value: any) {
    const storageKey = StorageService.getStorageKey(collection, key);
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  }

  static async exists(collection: string, key: string): Promise<boolean> {
    const storageKey = StorageService.getStorageKey(collection, key);
    return (await AsyncStorage.getItem(storageKey)) !== null;
  }

  private static getStorageKey(collection: string, key: string): string {
    return `${collection}${StorageService.KEY_PART_DELIMITER}${key}`;
  }
}