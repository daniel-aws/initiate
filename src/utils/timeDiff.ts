export function secDiffBetweenDates(x: Date, y: Date): number {
  const diff = (x.getTime() - y.getTime()) / 1000;
  return Math.abs(Math.round(diff));
}

export function minDiffBetweenDates(x: Date, y: Date): number {
  let diff = (x.getTime() - y.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}
