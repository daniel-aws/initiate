export function randomElement<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomNumBetweenRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomItemInObject(obj: any): any {
  const objectKeys = Object.keys(obj);
  const result = obj[objectKeys[(objectKeys.length * Math.random()) << 0]];
  return result;
}
