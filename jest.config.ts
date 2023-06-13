import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: `ts-jest`,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": `$1`,
  },
  transform: {
    '^.+\\.tsx?$': [
      `ts-jest`,
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [`.ts`],
  testEnvironment: `node`,
  rootDir: `./test`,
  testRegex: `\\.(test|e2e-test)\\.ts$`,
};

export default config;
