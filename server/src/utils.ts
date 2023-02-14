export const log = (from: string, message: string) => {
  const fromPad = `[${from}]`.padEnd(12, " ");

  console.log(`${fromPad}${message}`);
};
