function promisifyImpl(fn: (cb: (err: any, value?: any) => void) => void): Promise<any[]> {
  return new Promise(function (resolve, reject) {
    fn(function(err, value: any) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const args = Array.prototype.slice.call(arguments, 1);
      resolve(args);
    });
  });
}

function promisifyWithContextImpl(fn: (cb: (err: any, value?: any) => void) => void, context: any): Promise<any[]> {
  return new Promise(function (resolve, reject) {
    fn.apply(context, [function(err, value: any) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const args = Array.prototype.slice.call(arguments, 1);
      resolve(args);
    }]);
  });
}

export function promisify(fn: (cb: (err: any, value?: any) => void) => void, context?: any): Promise<any[]> {
  if (context !== undefined) {
    return promisifyWithContextImpl(fn, context);
  }
  return promisifyImpl(fn);
}