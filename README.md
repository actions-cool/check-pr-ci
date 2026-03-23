# 🚗 Check PR CI

![](https://img.shields.io/github/actions/workflow/status/actions-cool/check-pr-ci/test.yml?style=flat-square)
[![](https://img.shields.io/badge/marketplace-check--pr--ci-blueviolet?style=flat-square)](https://github.com/marketplace/actions/check-pr-ci)
[![](https://img.shields.io/github/v/release/actions-cool/check-pr-ci?style=flat-square&color=orange)](https://github.com/actions-cool/check-pr-ci/releases)

Check the PR CI status and perform some operation after success or failure.

Since CI execution takes time, this Action only support `schedule` trigger.

## 🍭 How to use?

```yml
name: Check PR CI

on:
  schedule:
    - cron: "*/10 * * * *"

jobs:
  check-pr-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions-cool/check-pr-ci@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          filter-label: 'check-ci'
          filter-creator-authority: 'write'
          filter-head-ref: 'master, feature'
          filter-support-fork: false
          success-review: true
          success-review-body: 'LGTM'
          success-merge: true
          merge-method: 'merge'
          merge-title: 'Auto merge (#${number})'
          failure-review: 'REQUEST_CHANGES'
          failure-review-body: 'PTAL'
          failure-close: true
```

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub token | string | ✖ |
| filter-label | Filter PR by label. | string | ✖ |
| filter-creator | Filter PR by creator name. | string | ✖ |
| filter-creator-authority | Filter PR by creator authority. | string | ✖ |
| filter-head-ref | Filter PR head ref branch. | string | ✖ |
| filter-support-fork | Filter PR come from. Default `true`. | boolean | ✖ |
| skip-run-names | Skip some run names. | string | ✖ |
| skip-check-label-name | Label name to skip during checks. | string | ✖ |
| success-review | Whether to approve when success. | boolean | ✖ |
| success-review-body | Review body. | string | ✖ |
| success-merge | Whether to merge when success. | boolean | ✖ |
| conflict-review-body | Comment when has conflict. | string | ✖ |
| merge-method | Merge method to use. Possible values are `merge`, `squash` or `rebase`. Default is `merge`. | string | ✖ |
| merge-title | Title for the automatic merge. | string | ✖ |
| merge-message | Extra detail to append to automatic merge. | string | ✖ |
| failure-review | Include REQUEST_CHANGES or COMMENT. | string | ✖ |
| failure-review-body | Review body. | string | ✖ |
| failure-close | Whether close PR. | boolean | ✖ |

- `merge-title`: `${number}` will be replaced with the current PR number
- `conflict-review-body`: Default is `😅 This branch has conflicts that must be resolved!`
- `failure-review`: When use this, the `failure-review-body` is necessary
- `skip-run-names`: [GitHub Doc](https://docs.github.com/en/rest/reference/checks#list-check-runs-for-a-git-reference) `check_runs` `name`. When you merge default branch into another, you should add `check-pr-ci` (The jobs name)
- `skip-check-label-name`: PR labels used to skip the CI run `in_progress`/`failure` loop. 

## ⚡ Feedback

You are very welcome to try it out and put forward your comments. You can use the following methods:

- Report bugs or consult with [Issue](https://github.com/actions-cool/check-pr-ci/issues)
- Submit [Pull Request](https://github.com/actions-cool/check-pr-ci/pulls) to improve the code of `check-pr-ci`

也欢迎加入 钉钉交流群

![](https://github.com/actions-cool/resources/blob/main/dingding.jpeg?raw=true)

## Changelog

[CHANGELOG](./CHANGELOG.md)

## LICENSE

[MIT](./LICENSE)
