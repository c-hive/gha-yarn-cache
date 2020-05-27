# gha-yarn-cache

#### 1-liner yarn install cache for GitHub Actions

Status and support

- &#x2714; stable
- &#x2714; supported
- &#x2716; no ongoing development

[![CI](/../../workflows/CI/badge.svg?branch=master)](/../../actions)

GitHub Action caches improve build times and reduce network dependencies. However, writing the correct cache logic is [tricky](https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/examples.md#node---yarn). You need to understand how the [cache action](https://github.com/actions/cache) (keys and restore keys) work. Did you know you're not supposed to cache the `node_modules` folder? The setup is different per OS and takes a lot of space in your workflows. Not anymore!

`gha-yarn-cache` is a simple 1-liner that covers all use-cases, correctly:
- Caches the Yarn cache directory instead of `node-modules` [as recommended](https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/examples.md#node---yarn)
- Works on Ubuntu, MacOS and Windows
- Restore keys take the OS into account [as recommended](https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/examples.md#node---yarn)
- Builds on the [native cache functionality of GitHub Actions](https://github.com/actions/toolkit/tree/master/packages/cache), same as [v2 of the generic cache action](https://github.com/actions/cache/issues/55#issuecomment-629433225)

## Usage

Add this step before `yarn install`:
```yml
uses: c-hive/gha-yarn-cache@v1
```

For example:

`.github/workflows/ci.yml`
```yml
name: CI

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1

    - uses: c-hive/gha-yarn-cache@v1

    - name: Install JS dependencies
      run: yarn install
    - name: Test
      run: yarn test
```

### Solution comparison

[Native](https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/examples.md#node---yarn)
```yml
- name: Get yarn cache directory path
  id: yarn-cache-dir-path
  run: echo "::set-output name=dir::$(yarn cache dir)"

- uses: actions/cache@v1
  id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
  with:
    path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-
```

`gha-yarn-cache`
```yml
- uses: c-hive/gha-yarn-cache@v1
```

## Conventions

This project follows [C-Hive guides](https://github.com/c-hive/guides) for code style, way of working and other development concerns.

## License

The project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
