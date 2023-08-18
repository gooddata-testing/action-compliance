# action-compliance

This action checks some rule on title, description or PR/commit authors.

# Supported checks

- This actin mainly checks if the PR contains a reference to a (JIRA) ticket in its title or description
  - For details check `required-ticket-regex` input variable below

But there are exceptions to this rule. For some PRs it is desirable to skip such requirement:

-  If all commits of the PR are generated by a bot or a power user.
  - For more details see the option `special-authors` below
- If the PR is simple enough and creating a ticket would be a waste of time.
  - This is used for example when the author fixes a typo etc.
  - For details see the option `special-title-regexes`
# Inputs

Name | Default | Type | Description
--- | --- | --- | ---
token | `secrets.GITHUB_TOKEN` | String | The token needs to have `pull_requests: read` permission.
special-authors | (none) | String of strings (separated with new lines) | The strings are taken as regular expressions. If all commits in the PR have authors who match these regular expressions then the PR is considered compliant. 
special-title-regexes | (none) | String of strings (separated with new lines) | If the PR *title* matches one of these regular expressions then the PR is considered compliant.
required-ticket-regex | (none) | String | If the PR title or description match this regular expression then the PR is compliant.

If a particular input is not used the related check will be skipped.

*WARNING:* The regular expressions taken from action inputs don't need to be escaped (the backslash should not be doubled).
# Example

```yaml
jobs:
  compliance-check:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read
    steps:
      - uses: gooddata-testing/action-compliance@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          special-authors: |
            ext-repo-updater-[0-9]*
            ci-merger
            ci-maintainer
          special-title-regexes: |
            ^TRIVIAL\b.*
            ^\[Draft\]\s?TRIVIAL\b.*
            ^Draft:\s?TRIVIAL\b.*
            ^\(Draft\)\s?TRIVIAL\b.*
            ^MERGE-BACK:\s.*
            ^UPDATE:\s.*
          required-ticket-regex: .*\b[A-Z]{2,}-[0-9]+\b.*
```

# Development

## How to build this action

Clone this git repository.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

The latter command builds the release version of the javascript code in the dist/ directory.

The changes in this directory need to be then pushed to the `main` branch so it can be used by referencing the @main version of the action.