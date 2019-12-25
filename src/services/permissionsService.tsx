import { PermissionsAndroid, Permission } from 'react-native';

export class PermissionService {
  static readonly BASE_PERMISSIONS: Permission[] = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
  
  static async requestMissingBasePermissions() {
    const missingPermissions: Permission[] = await PermissionService.getMissingBasePermissions();
    if (missingPermissions.length === 0) return;
    const results = await PermissionsAndroid.requestMultiple(missingPermissions);
    console.log('PERMISSION REQUEST RESULT:');
    console.log(JSON.stringify(results));
  }

  private static async getMissingBasePermissions(): Promise<Permission[]> {
    let missingPermissions: Permission[] = [];
    for (let permission of PermissionService.BASE_PERMISSIONS) {
      if (!(await PermissionsAndroid.check(permission))) {
        missingPermissions.push(permission);
      }
    }
    return missingPermissions;
  }
}