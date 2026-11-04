export function sleep(ms: number, throws?: boolean) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (throws ? reject(new Error()) : resolve(true)), ms);
  });
}
