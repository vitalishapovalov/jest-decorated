# Instructions

These steps will guide you through contributing to this project:

## Installation

[Lerna](https://github.com/lerna/lerna) is used to manage multiple packages and you will need it during the installation process.

- Fork the repo

- Clone it

- Install `lerna`

- Install dependencies

```bash
git clone https://github.com/YOUR-USERNAME/jest-decorated

npm i -g lerna

npm run bootstrap
```

## Testing

To run tests in all packages:

```bash
npm test
```

To run tests for specific package, simply run it from within the package dir, for example:

```bash
cd packages/core

npm test
```

Coverage will be collected and displayed during tests execution. After tests execution, each package will have `coverage` dir with detailed information.

## Building

To build all of the packages:

```bash
npm run build
```

To build specific package, simply run it from within the package dir, for example:

```bash
cd packages/core

npm run build
```

## Publishing

Simply

```bash
lerna publish
```

## Other available commands

| Command              | Description                                                    |
| -------------------- | ---------------------------------------------------------------|
| `npm run clean`      | Delete all of the `node_modules`, `rpt2_cache` and `coverage`  |                                                   |         
| `npm run cleanBuild` | Clean, install and build                                       |     
| `npm run lint`       | Run tslint in all packages                                     |  
