import * as core from '@actions/core'
import {context} from '@actions/github/lib/utils'
import {hasOnlySpecialAuthors, hasSpecialTitle, matchesTicketRegex} from './checks'

const SPECIAL_AUTHORS = core.getInput('special-authors').trim()
const SPECIAL_TITLE_REGEXES = core.getInput('special-title-regexes').trim()
const REQUIRED_TICKET_REGEX = core.getInput('required-ticket-regex').trim()

async function run(): Promise<void> {
  try {

    // First condition:
    // If all commits are from special authors
    //
    if(SPECIAL_AUTHORS!=undefined && SPECIAL_AUTHORS!="") {
      if(await hasOnlySpecialAuthors(SPECIAL_AUTHORS, core.getInput('token'))) {
        return
      }
    }

    const prTitle = context?.payload?.pull_request?.title
    if(prTitle==undefined) {
      core.setFailed("Failed to determine pull request title")
      return
    }

    // Second condition:
    // The pull request title states it is a special PR
    //
    if(SPECIAL_TITLE_REGEXES!=undefined && SPECIAL_TITLE_REGEXES!="") {
      if(hasSpecialTitle(SPECIAL_TITLE_REGEXES, prTitle)) {
        return 
      }
    }

    // Third condition:
    // The pull request title or description match a special regex (usually a ticket)
    //
    const prDescription = context?.payload?.pull_request?.body
    if(prDescription==undefined) {
      core.setFailed("Failed to determine pull request description")
      return
    }

    if(REQUIRED_TICKET_REGEX!=undefined && REQUIRED_TICKET_REGEX!="") {
      if(matchesTicketRegex(REQUIRED_TICKET_REGEX, prTitle, prDescription)) {
        return
      }
    }
    core.setFailed("PR is not compliant")
    
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
