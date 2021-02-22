# 🚗 Check PR CI

![](https://img.shields.io/github/workflow/status/actions-cool/check-pr-ci/CI?style=flat-square)
[![](https://img.shields.io/badge/marketplace-check--pr--ci-blueviolet?style=flat-square)](https://github.com/marketplace/actions/check-pr-ci)
[![](https://img.shields.io/github/v/release/actions-cool/check-pr-ci?style=flat-square&color=orange)](https://github.com/actions-cool/check-pr-ci/releases)


Check the PR CI status and perform some operation after success or failure.

Since CI execution takes time, this Action only support `schedule` trigger.

## How to use?

```yml
name: Check PR CI

on:
  schedule:
    - cron: "*/10 * * * *"

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions-cool/check-pr-ci@v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          filter-label: 'check-ci'
          filter-creator-authority: 'write'
          success-review: true
          success-review-body: 'LGTM'
          success-merge: true
          merge-method: 'merge'
          merge-title: 'Auto merge (#${number})'
          failure-review: 'REQUEST_CHANGES'
          failure-close: true
```

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub token | string | ✖ |
| filter-label | Filter PR by label. | string | ✖ |
| filter-creator | Filter PR by creator name. | string | ✖ |
| filter-creator-authority | Filter PR by creator authority. | string | ✖ |
| success-review | Whether to approve when success. | boolean | ✖ |
| success-review-body | Review body. | string | ✖ |
| success-merge | Whether to merge when success. | boolean | ✖ |
| merge-method | Merge method to use. Possible values are `merge`, `squash` or `rebase`. Default is `merge`. | string | ✖ |
| merge-title | Title for the automatic merge. | string | ✖ |
| merge-message | Extra detail to append to automatic merge. | string | ✖ |
| failure-review | Include REQUEST_CHANGES or COMMENT. | string | ✖ |
| failure-review-body | Review body. | string | ✖ |
| failure-close | Whether close PR. | boolean | ✖ |

- `merge-title`: `${number}` will be replaced with the current PR number

## Changelog

[CHANGELOG](./CHANGELOG.md)

## LICENSE

[MIT](./LICENSE)
