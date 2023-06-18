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
  collectCoverage: true,
  coverageDirectory: `./coverage/`,
  coverageProvider: `v8`,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: -10,
    },
  },
};

export default config;
