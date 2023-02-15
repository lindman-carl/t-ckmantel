import { validateWord } from "./utils.js";

describe("validateWord", () => {
  it("should return false if word is empty", () => {
    expect(validateWord("")).toBe(false);
  });

  it("should return true if word is not empty", () => {
    expect(validateWord("a")).toBe(true);
    expect(validateWord("test")).toBe(true);
  });
});
