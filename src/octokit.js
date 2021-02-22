const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

const { checkPermission } = require('actions-util');

const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });

// *******************************************************
async function getIssues(params, page = 1) {
  let { data: issues } = await octokit.issues.listForRepo({
    ...params,
    per_page: 100,
    page,
  });
  if (issues.length >= 100) {
    issues = issues.concat(await getIssues(params, page + 1));
  }
  return issues;
}

async function getPR(params, page = 1) {
  let { data: prs } = await octokit.pulls.list({
    ...params,
    per_page: 100,
    page,
  });
  if (prs.length >= 100) {
    prs = prs.concat(await getPR(params, page + 1));
  }
  return prs;
}

async function checkAuthority(owner, repo, username, filterCreatorAuthority) {
  let out;
  const res = await octokit.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username,
  });
  const { permission } = res.data;
  out = checkPermission(filterCreatorAuthority, permission);
  core.info(`The user ${username} check auth ${out}!`);
  return out;
}

async function getPRStatus(owner, repo, number) {
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: number,
  });

  const commit = pr.head.sha;
  const refOwner = pr.head.user.login;

  const {
    data: { state: commitState },
  } = await octokit.repos.getCombinedStatusForRef({
    owner: refOwner,
    repo,
    ref: commit,
  });

  const runs = await queryRefStatus(owner, repo, commit);

  let ifCICompleted = true;
  let ifCIHasFailure = false;
  runs.forEach(it => {
    if (it.status !== 'completed') {
      ifCICompleted = false;
    }
    if (it.conclusion === 'failure') {
      ifCIHasFailure = true;
    }
  });

  return {
    commitState,
    ifCICompleted,
    ifCIHasFailure,
  };
}

async function queryRefStatus(owner, repo, commit, page = 1) {
  let {
    data: { check_runs },
  } = await octokit.checks.listForRef({
    owner,
    repo,
    ref: commit,
    per_page: 100,
    page,
  });
  if (check_runs.length >= 100) {
    check_runs = check_runs.concat(await queryRefStatus(owner, repo, commit, page + 1));
  }
  return check_runs;
}

async function doPRReview(owner, repo, number, event, body) {
  let params = {
    owner,
    repo,
    pull_number: number,
    event,
  };

  if (body) {
    params.body = body;
  }

  await octokit.pulls.createReview(params);
  core.info(`Actions: [${event}-PR] [number: ${number}] [body: ${body}]!`);
}

async function doPRMerge(owner, repo, number, mergeMethod, mergeTitle, mergeMessage) {
  let params = {
    owner,
    repo,
    pull_number: number,
    merge_method: mergeMethod,
  };
  if (mergeMessage) {
    params.commit_message = mergeMessage;
  }
  if (mergeTitle) {
    if (mergeTitle.includes('${number}')) {
      params.commit_title = mergeTitle.replace('${number}', `${number}`);
    } else {
      params.commit_title = mergeTitle;
    }
  }
  await octokit.pulls.merge(params);
  core.info(`Actions: [${mergeMethod}-PR] [number: ${number}]!`);
}

async function doClosePR(owner, repo, number) {
  await octokit.issues.update({
    owner,
    repo,
    issue_number: number,
    state: 'closed',
  });
  core.info(`Actions: [close-pr][${number}] success!`);
}

// *******************************************************
module.exports = {
  getIssues,
  getPR,
  checkAuthority,
  getPRStatus,
  doPRReview,
  doPRMerge,
  doClosePR,
};
