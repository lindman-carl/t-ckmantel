export const log = (from: string, message: string) => {
  const fromPad = `[${from}]`.padEnd(16, " ");

  console.log(`${fromPad}${message}`);
};
