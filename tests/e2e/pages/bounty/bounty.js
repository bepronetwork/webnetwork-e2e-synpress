import Page from "../page";
import { FirstPrData } from "../payload/bounty";
import { interceptGroup } from "../helpers/handleEqualIntercepts";

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

  getCreateProposalButton() {
    return cy.contains("Create Proposal");
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
  interceptGroup.getPrGithub;

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

export function recognizeAsFinished(address) {
  const bounty = new Bounty();
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

  interceptGroup.getIssueCommentsGithub;
  interceptGroup.getGithubCurrentRepos;
  interceptGroup.getPrGithub;
  interceptGroup.getPrCount;
  interceptGroup.getParticipants;
  interceptGroup.searchUsers(address);

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

export function RedeemBounty() {
  const bounty = new Bounty();

  cy.contains("Redeem", {
    timeout: 60000,
  });

  bounty.getRedeemButton().click();
  cy.wait(1000);
  cy.isMetamaskWindowActive();
  cy.wait(1000);
  cy.confirmMetamaskTransaction({});
  cy.contains("Redeem", {
    timeout: 60000,
  }).should("not.exist");
  cy.contains("canceled", {
    timeout: 60000,
  }).should("exist");
}
