function logInfo(tag: string, obj?: any, ...args: any[]) {
  console.log(`${new Date().toISOString()} [info] [${tag}]`, obj ?? '', ...args);
}

function logError(tag: string, obj?: any, ...args: any[]) {
  console.error(`${new Date().toISOString()} [error] [${tag}]`, obj ?? '', ...args);
}

export { logInfo, logError };
