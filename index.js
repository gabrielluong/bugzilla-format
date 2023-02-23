const github = require("@actions/github");
const core = require('@actions/core');

async function run() {
  try {
    const token = core.getInput("github-token");
    const octokit = new github.getOctokit(token);
    const payload = github.context.payload;
    const repo = payload.repository.name;
    const owner = payload.repository.owner.login;
    const pullRequestNumber = payload.number;

    if (pullRequestNumber === undefined) {
      core.warning("No pull request number in payload.");
      return;
    }

    const commits = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });

    const bugzillaRegExp = new RegExp("\\bBug (\\d+)\\b");

    for (const { commit } of commits.data) {
      if (!commit.message.startsWith("Revert") &&
          !commit.message.startsWith("Merge") &&
          !bugzillaRegExp.test(commit.message)) {
        const body = `🚧 Commit message is using the wrong format: _${commit.message}_\n\nThe comment message should look like:\n
        Bug xxxx - Short description of your change\n
        Optionally, a longer description of the change.
        `;

        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pullRequestNumber,
          body,
        });

        throw new Error(body);
      }
    }

    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });
    const { title } = pullRequest;

    if (!bugzillaRegExp.test(title)) {
      const body = `🚧 Pull request title is using the wrong format: _${title}_\n\nThe pull request title should look like:\n
      Bug xxxx - Short description of your change
      `;

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullRequestNumber,
        body,
      });

      throw new Error(body);
    }

    core.notice(`PR title and commit messages are using the correct format.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
