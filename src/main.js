const core = require('@actions/core');
const github = require('@actions/github');

const { dealStringToArr } = require('actions-util');

const {
  getIssues,
  getPR,
  getOnePR,
  checkAuthority,
  getPRStatus,
  doPRReview,
  doPRMerge,
  doClosePR,
} = require('./octokit');

// **********************************************************
const context = github.context;

async function run() {
  try {
    if (context.eventName === 'schedule') {
      const { owner, repo } = context.repo;
      const filterLabel = core.getInput('filter-label');
      const filterCreator = core.getInput('filter-creator');
      const filterCreatorAuthority = core.getInput('filter-creator-authority');
      const filterHeadRef = core.getInput('filter-head-ref');
      const filterSupportFork = core.getInput('filter-support-fork') || 'true';

      const successReview = core.getInput('success-review');
      const successReviewBody = core.getInput('success-review-body');

      const successMerge = core.getInput('success-merge');
      const mergeMethod = core.getInput('merge-method') || 'merge';
      const mergeTitle = core.getInput('merge-title');
      const mergeMessage = core.getInput('merge-message');

      const failureReview = core.getInput('failure-review');
      const failureReviewBody = core.getInput('failure-review-body');
      const failureClose = core.getInput('failure-close');

      // filter
      let filterPRs = [];
      let params = {
        owner,
        repo,
        state: 'open',
      };
      if (filterLabel) {
        params.labels = filterLabel;
      }
      const data = filterLabel ? await getIssues(params) : await getPR(params);
      if (data.length) {
        for await (let it of data) {
          const filterCreatorResult = filterCreator
            ? dealStringToArr(filterCreator).includes(it.user.login)
            : true;
          const checkPRType = filterLabel ? it.pull_request : true;
          let checkPRHeadRef = true;
          if (filterHeadRef) {
            const onePR = await getOnePR(owner, repo, it.number);
            checkPRHeadRef = dealStringToArr(filterHeadRef).includes(onePR.head.ref);
          }
          let checkPRFork = true;
          if (filterSupportFork == 'false') {
            const onePR = await getOnePR(owner, repo, it.number);
            checkPRFork = owner === onePR.head.user.login;
          }
          if (filterCreatorResult && checkPRType && checkPRHeadRef && checkPRFork) {
            if (filterCreatorAuthority) {
              const checkAuthResult = await checkAuthority(
                owner,
                repo,
                it.user.login,
                filterCreatorAuthority,
              );
              if (checkAuthResult) {
                filterPRs.push(it.number);
              }
            } else {
              filterPRs.push(it.number);
            }
          }
        }
        core.info(`Actions: [query-PR] [filter: ${JSON.stringify(filterPRs)}]!`);
      } else {
        core.info(`Actions: [query-PR] none!`);
      }

      if (filterPRs.length === 0) {
        core.info(`Actions: [query-filterPRs] none!`);
        return false;
      }

      // check
      for (let i = 0; i < filterPRs.length; i++) {
        let number = filterPRs[i];
        const result = await getPRStatus(owner, repo, number);
        if (result.ifCICompleted) {
          if (
            (result.commitState === 'success' || result.commitState === 'pending') &&
            !result.ifCIHasFailure
          ) {
            if (successReview === 'true') {
              await doPRReview(owner, repo, number, 'APPROVE', successReviewBody);
            }
            if (successMerge === 'true') {
              await doPRMerge(owner, repo, number, mergeMethod, mergeTitle, mergeMessage);
            }
          } else {
            if (failureReview == 'REQUEST_CHANGES' || failureReview == 'COMMENT') {
              await doPRReview(owner, repo, number, failureReview, failureReviewBody);
            }
            if (failureClose === 'true') {
              await doClosePR(owner, repo, number);
            }
          }
        }
      }
    } else {
      core.setFailed(`This Action only support "schedule". CI process need time!`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
