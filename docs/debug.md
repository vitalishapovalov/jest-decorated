# Debug

In `jest-decorated` package, the logs are done via the [debug](https://www.npmjs.com/package/debug) tool.

To see the debug logs of the jest-decorated, set the `DEBUG=jest-decorated:*` environment variable before the tests execution.

For example:

```shell
DEBUG=jest-decorated:* npm test
```
