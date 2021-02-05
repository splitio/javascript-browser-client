# Contributing to the Split JS Browser SDK

Split SDK is an open source project and we welcome feedback and contribution. The information below describes how to build the project with your changes, run the tests, and send the Pull Request(PR).

## Development

### Development process

1. Fork the repository and create a topic branch from `development` branch. Please use a descriptive name for your branch.
2. While developing, use descriptive messages in your commits. Avoid short or meaningless sentences like: "fix bug".
3. Make sure to add tests for both positive and negative cases.
4. If your changes have any impact on the public API, make sure you update the TypeScript declaration files as well as it's related test file.
5. Run the linter script of the project and fix any issues you find.
6. Run the build script and make sure it runs with no errors.
7. Run all tests and make sure there are no failures.
8. Run the TypeScript declarations tests and make sure it compiles correctly.
9. `git push` your changes to GitHub within your topic branch.
10. Open a Pull Request(PR) from your forked repo and into the `development` branch of the original repository.
11. When creating your PR, please fill out all the fields of the PR template, as applicable, for the project.
12. Check for conflicts once the pull request is created to make sure your PR can be merged cleanly into `development`.
13. Keep an eye out for any feedback or comments from Split's SDK team.

### Building the SDK

For widespread use of the SDK with different environments and module formats, we have three different builds:
* A bundled **UMD** file (located in `/umd` folder).
* A **ES2015** modules compatible build (located in `/esm` folder).
* A **CommonJS** modules compatible build (located in `/cjs` folder).

The different builds can be generated all at once with the command `npm run build`. Refer to [package.json](package.json) for more insight on the build scripts.

### Running tests

The project includes unit as well as integration tests for browser environments.

All tests can be run at once with the command `npm run test`.

If you've updated the TypeScript declaration files (located in `/types` folder), you should add some lines verifying the updates in `/ts-tests/index.ts` and then run the TypeScript compilation test using the `npm run test-ts-decls` command.

For additional testing scripts or to get more insight on how these work, please refer to our [package.json](package.json) file.

### Linting and other useful checks

Consider running the linter and type check script (`npm run check`) and fixing any issues before pushing your changes.

If you want to debug your changes consuming it from a test application, you could import the **UMD** bundle from an HTML document and debug it using the browser dev tools.

# Contact

If you have any other questions or need to contact us directly in a private manner send us a note at sdks@split.io