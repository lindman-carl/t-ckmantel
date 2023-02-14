export const log = (from: string, message: string) => {
  const fromPad = `[${from}]`.padEnd(10, " ");

  console.log(`${fromPad}${message}`);
};
