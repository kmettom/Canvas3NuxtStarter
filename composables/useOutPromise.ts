let outPromise: Promise<unknown> = Promise.resolve();

export function setOutPromise<T>(p: Promise<T>): void {
  outPromise = p;
}

export function waitOutDone(): Promise<unknown> {
  return outPromise;
}
