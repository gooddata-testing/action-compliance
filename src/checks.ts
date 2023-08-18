import * as core from "@actions/core";
import * as github from "@actions/github";

async function hasOnlySpecialAuthors(SPECIAL_AUTHORS: string, token: string): Promise<boolean> {
    const octokit = github.getOctokit(token);
    const {
        eventName,
        payload: { repository: repo, pull_request: pull_request },
    } = github.context;
    if (eventName != "pull_request") {
        core.setFailed("Unsupported event: ${eventName}");
        return true;
    }
    if (!repo) {
        core.setFailed("repo is undefined in github even context");
        return true;
    }
    if (!pull_request) {
        core.setFailed("pull_request is undefined in github even context");
        return true;
    }

    const commits = await octokit.rest.pulls.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        pull_number: pull_request.number,
    });

    let allCommitsHaveSpecialAuthors: boolean = true;
    for (let commit of commits.data) {
        if (commit.author == null) {
            break;
        }
        const commit_author = commit.author.login;
        core.debug("author: " + commit_author);

        let foundSpecialAuthor: boolean = false;
        for (let author of SPECIAL_AUTHORS.split("\n")) {
            core.debug("special author: " + author);
            let r = RegExp(author);
            if (r.test(commit_author)) {
                core.debug("Special author matches commit author");
                foundSpecialAuthor = true;
                break;
            } else {
                core.debug("Special author does not match commit author");
            }
        }
        if (!foundSpecialAuthor) {
            allCommitsHaveSpecialAuthors = false;
            break;
        }
    }
    if (allCommitsHaveSpecialAuthors) {
        core.info("All commits have special author => PR is compliant");
        return true;
    }
    core.debug("Not all commits have special author => checking further");
    return false;
}

function hasSpecialTitle(SPECIAL_TITLE_REGEXES: string, prTitle: string): boolean {
    let foundMatchingSpecialRegex = false;
    for (let regex of SPECIAL_TITLE_REGEXES.split("\n")) {
        let r = RegExp(regex);
        if (r.test(prTitle)) {
            foundMatchingSpecialRegex = true;
            break;
        }
    }
    if (foundMatchingSpecialRegex) {
        core.info("Title mentions special keywoard => PR is compliant");
        return true;
    }
    core.debug("The title does not mention any special keyword  => checking further");
    return false;
}

function matchesTicketRegex(REQUIRED_TICKET_REGEX: string, prTitle: string, prDescription: string): boolean {
    core.debug("title: " + prTitle);
    core.debug("description: " + prDescription);
    core.debug("regex: " + REQUIRED_TICKET_REGEX);
    let r = RegExp(REQUIRED_TICKET_REGEX.trim());
    core.debug("compiled regex: " + r);
    if (r.test(prTitle) || r.test(prDescription)) {
        core.info("Title or description matches the required ticket regular expression => PR is compliant");
        return true;
    }
    core.debug("Neither title nor description match the required ticket regular expression");
    return false;
}

export { hasOnlySpecialAuthors, hasSpecialTitle, matchesTicketRegex };
