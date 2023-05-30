import { JestConfigWithTsJest } from "ts-jest/dist/types";

const config: JestConfigWithTsJest = {
  preset: `ts-jest`,
  testEnvironment: `node`,
  rootDir: `./test`,
  testRegex: `\\.(test|e2e-test)\\.ts$`,
};

export default config;
