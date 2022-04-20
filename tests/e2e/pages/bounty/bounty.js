import Page from "../page";
import {
  UserBranchsData,
  Forksdata,
  ReposNetworkData,
  ReposUserData,
  FirstPrData,
  StatusPrGithubData,
  PrCommitsGithubData,
  FirstProposalData,
  SecondProposalData,
} from "../payload/bounty";

export class Bounty extends Page {
  getRedeemButton() {
    return cy.get("button").contains("Redeem");
  }
  getStartWorkingButton() {
    return cy.contains("Start Working", {
      timeout: 60000,
    });
  }
  getCreatePullRequestButton() {
    return cy.contains("Create Pull Request", {
      timeout: 60000,
    });
  }
  getRecognizeAsFinishedButton() {
    return cy.contains("Recognize as finished");
  }
}

export function StartWorking() {
  const bounty = new Bounty();

  interceptGroup.getGithubForks;
  interceptGroup.getGithubCurrentBranchs;
  interceptGroup.getGithubCurrentRepos;
  interceptGroup.getIssueCommentsGithub;

  cy.intercept({
    method: "GET",
    url: "/api/issue/*/*/bepro",
    times: 5000,
  }).as("getIssueData");

  cy.wait([
    "@getGithubForks",
    "@getGithubCurrentBranchs",
    "@getGithubCurrentRepos",
    "@getIssueCommentsGithub",
  ]);

  bounty.getStartWorkingButton().should("exist").click({ force: true });

  cy.wait(["@getIssueData"]);

  bounty.waitForTransactionSuccess();

  bounty.getStartWorkingButton().should("not.exist");

  bounty.getCreatePullRequestButton().should("exist");
}

export function CreatePullRequest() {
  interceptGroup.postPullRequest;
  interceptGroup.getIssueCommentsGithub;
  interceptGroup.getGithubCurrentRepos;
  interceptGroup.getPrCount;

  cy.intercept(
    {
      method: "GET",
      url: "/api/issue/*/*/bepro",
      times: 5000,
    },
    ({ reply, headers }) => {
      delete headers["if-none-match"]; // prevent caching
      reply(({ body }) => {
        body.state = "ready";
        body.pullRequests = [FirstPrData(body.issueId, body.createdAt)];
        return body;
      });
    }
  ).as("getIssuePrData");

  cy.intercept(
    {
      method: "GET",
      url: "/repos/bepronetwork/bepro-js-edge/pulls/*",
      hostname: "api.github.com",
    },
    {
      body: StatusPrGithubData,
    }
  ).as("getPrGithub");

  bounty.getCreatePullRequestButton().click({ force: true });
  cy.get("h3").contains("Create Pull Request").should("exist");
  cy.get(".react-select__input").click({ force: true }).type("{enter}");
  cy.get("span").contains("Create Pull Request").click({ force: true });
  cy.wait("@postPullRequest");
  cy.wait([
    "@getIssueCommentsGithub",
    "@getGithubCurrentRepos",
    "@getIssuePrData",
    "@getPrCount",
    "@getPrGithub",
  ]);

  bounty.waitForTransactionSuccess();
}

export function recognizeAsFinished() {
  interceptGroup.getIssueCommentsGithub;
  interceptGroup.getGithubCurrentRepos;

  cy.intercept(
    {
      method: "GET",
      url: "/api/issue/*/*/bepro",
      times: 5000,
    },
    ({ reply, headers }) => {
      delete headers["if-none-match"]; // prevent caching
      reply(({ body }) => {
        body.state = "ready";
        body.pullRequests = [FirstPrData(body.issueId, body.createdAt)];
        return body;
      });
    }
  ).as("getIssuePrData");

  cy.intercept(
    {
      method: "GET",
      url: "/repos/bepronetwork/bepro-js-edge/pulls/*",
      hostname: "api.github.com",
    },
    {
      body: StatusPrGithubData,
    }
  ).as("getPrGithub");

  cy.intercept(
    {
      method: "GET",
      url: "/repos/bepronetwork/bepro-js-edge/pulls/*/commits",
      hostname: "api.github.com",
    },
    {
      body: [PrCommitsGithubData],
    }
  ).as("getParticipants");

  cy.intercept(
    {
      method: "GET",
      url: "/repos/bepronetwork/bepro-js-edge/commits",
      hostname: "api.github.com",
    },
    {
      body: [PrCommitsGithubData],
    }
  ).as("getCommits");

  cy.intercept("POST", "/api/search/users/login", {
    statusCode: 200,
    body: [userData(metamaskWalletAddress)],
  }).as("searchUsers");

  bounty.getRecognizeAsFinishedButton().click({ force: true });
  cy.wait(500);
  cy.confirmMetamaskTransaction({});
  cy.wait([
    "@getIssueCommentsGithub",
    "@getGithubCurrentRepos",
    "@getIssuePrData",
    "@getPrGithub",
    "@getPrCount",
    "@getParticipants",
    "@searchUsers",
  ]);
  cy.wait(1000);
}

const hostGithub = "api.github.com";

const interceptGroup = {
  getGithubForks: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/forks?per_page=100",
        hostname: hostGithub,
      },
      {
        statusCode: 200,
        body: Forksdata,
      }
    )
    .as("getGithubForks"),

  getGithubCurrentBranchs: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/branches",
        hostname: hostGithub,
      },
      UserBranchsData
    )
    .as("getGithubCurrentBranchs"),

  getGithubCurrentRepos: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*",
        hostname: hostGithub,
      },
      ReposUserData
    )
    .as("getGithubCurrentRepos"),

  getIssueCommentsGithub: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/issues/*/comments",
        hostname: hostGithub,
      },
      {
        statusCode: 200,
        body: [],
      }
    )
    .as("getIssueCommentsGithub"),

  postPullRequest: cy
    .intercept(
      {
        method: "POST",
        url: "/api/pull-request",
        times: 2000,
      },
      {
        body: "ok",
      }
    )
    .as("postPullRequest"),

  getPrCount: cy
    .intercept("GET", "/api/pull-request?*", {
      count: 1,
    })
    .as("getPrCount"),
};
