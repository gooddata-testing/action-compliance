import * as core from '@actions/core'
import * as github from '@actions/github'
import {context} from '@actions/github/lib/utils'

const SPECIAL_AUTHORS = core.getInput('special-authors').trim()
const SPECIAL_TITLE_REGEXES = core.getInput('special-title-regexes').trim()
const REQUIRED_TICKET_REGEX = core.getInput('required-ticket-regex').trim()

async function run(): Promise<void> {
  try {

    core.info("Hello from action-compliance")
    const { eventName, payload: {repository: repo, pull_request: pull_request} } = github.context
    if (eventName != "pull_request") {
      core.setFailed("Unsupported event: ${eventName}")
      return
    }
    if (repo == undefined) {
      core.setFailed("repo is undefined in github even context")
      return
    }
    if (pull_request == undefined) {
      core.setFailed("pull_request is undefined in github even context")
      return
    }
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    // First condition:
    // If all commits are from special authors
    //
    if(SPECIAL_AUTHORS!=undefined && SPECIAL_AUTHORS!="") {
      const commits = await octokit.rest.pulls.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        pull_number: pull_request.number
      })

      var allCommitsHaveSpecialAuthors:boolean = true
      for(let commit of commits.data) {
        if(commit.author==null) {
          break
        }
        var commit_author = commit.author.login
        core.debug("author: " + commit_author)

        var foundSpecialAuthor:boolean = false
        for(let author of SPECIAL_AUTHORS.split('\n'))  {
          core.debug("special author: " + author)
          var r = RegExp(author)
          if(r.test(commit_author)) {
            core.debug("Special author matches commit author")
            foundSpecialAuthor = true
            break
          } else {
            core.debug("Special author does not match commit author")
          }
        };
        if(!foundSpecialAuthor) {
          allCommitsHaveSpecialAuthors = false
          break
        }
      };
      if(allCommitsHaveSpecialAuthors) {
        core.info("All commits have special author => PR is compliant")
        return
      }
      core.debug("Not all commits have special author => checking further")
    }

    const prTitle = context?.payload?.pull_request?.title
    if(prTitle==undefined) {
      core.setFailed("Failed to determine pull request title")
      return
    }
    const prDescription = context?.payload?.pull_request?.body
    if(prDescription==undefined) {
      core.setFailed("Failed to determine pull request description")
      return
    }

    // Second condition:
    // The pull request title or description states it is a special PR
    //
    if(SPECIAL_TITLE_REGEXES!=undefined && SPECIAL_TITLE_REGEXES!="") {
      var foundMatchingSpecialRegex = false
      for(let regex of SPECIAL_TITLE_REGEXES.split('\n')) {
        r = RegExp(regex)
        if(r.test(prTitle) || r.test(prDescription)) {
          foundMatchingSpecialRegex = true
          break
        }
      }
      if(foundMatchingSpecialRegex) {
        core.info("Title or description mentions special keywoard => PR is compliant")
        return
      }
      core.debug("The title nor description mention special keywords  => checking further")
    }

    // Third condition:
    // The pull request title or description match a special regex (usually a ticket)
    //
    if(REQUIRED_TICKET_REGEX!=undefined && REQUIRED_TICKET_REGEX!="") {
      r = RegExp(REQUIRED_TICKET_REGEX.trim())
      if(r.test(prTitle) || r.test(prDescription)) {
        core.info("Title or description matches the required ticket regular expression => PR is compliant")
        return
      }
      core.debug("Neither title nor description maches the required ticket regular expression")
    }
    core.setFailed("PR is not compliant")
    
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
