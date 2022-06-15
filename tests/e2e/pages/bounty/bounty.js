import Page from "../page";
import { FirstPrData, SecondPrData, ResponsePrData } from "../payload/bounty";
import { interceptGroup } from "../helpers/handleEqualIntercepts";

export class Bounty extends Page {
  getRedeemButton() {
    return cy.get("button").contains("Cancel");
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

  getPullRequestDraft() {
    return cy.contains("Draft");
  }

  getCreateProposalButton() {
    return cy.get("button").contains("Create Proposal");
  }

  getMakeReadyForReviewButton() {
    return cy.contains("Make ready for review");
  }
  getBackPullRequest() {
    return cy.get("svg.rounded-circle").click({ force: true });
  }
}

export function StartWorking() {
  const bounty = new Bounty();

  cy.intercept({
    method: "GET",
    url: "/api/issue/*/*/bepro",
    times: 5000,
  }).as("getIssueData");

  bounty.getStartWorkingButton().should("exist").click({ force: true });

  cy.wait(["@getIssueData", "@gqlCommentsQuery", "@gqlRepositoriesQuery"]);

  bounty.waitForTransactionSuccess();

  bounty.getStartWorkingButton().should("not.exist");

  bounty.getCreatePullRequestButton().should("exist");
}

export function CreatePullRequest() {
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

  bounty.getCreatePullRequestButton().click({ force: true });
  cy.wait(["@gqlBranchesQuery", "@gqlRepositoriesQuery"]);
  cy.get("h3").contains("Create Pull Request").should("exist");
  cy.wait(1500);
  cy.get(".react-select__input").click({ force: true }).type("{enter}");
  cy.get("span").contains("Create Pull Request").click({ force: true });
  cy.wait(500);

  cy.intercept("POST", "/api/pull-request", {
    body: ResponsePrData,
  });
  cy.confirmMetamaskTransaction({});
  cy.intercept("POST", "/api/past-events/pull-request/created", {
    body: ["1540"],
  });
  cy.wait("@gqlDetailsQuery");
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
        body.pullRequests = [SecondPrData(body.issueId, body.createdAt)];
        return body;
      });
    }
  ).as("getIssuePrData2");

  interceptGroup.searchUsers(address);

  cy.contains("1 pull request").should("exist");
  bounty.getPullRequestDraft().click({ force: true });
  cy.contains("Pull Request").should("exist");
  bounty.getMakeReadyForReviewButton().should("exist");
  bounty.getMakeReadyForReviewButton().click({ force: true });
  cy.confirmMetamaskTransaction({});
  cy.intercept("POST", "/api/past-events/pull-request/ready", {
    body: ["1181"],
  });
  cy.wait([
    "@gqlCommentsQuery",
    "@gqlDetailsQuery",
    "@getIssuePrData2",
  ]);
  bounty.getBackPullRequest()
  cy.wait("@searchUsers")
}

export function RedeemBounty() {
  const bounty = new Bounty();

  cy.contains("Cancel", {
    timeout: 60000,
  });
  bounty.getRedeemButton().click();
  cy.wait(1000);
  cy.isMetamaskWindowActive();
  cy.wait(1000);
  cy.confirmMetamaskTransaction({});

  cy.contains("Cancel", {
    timeout: 60000,
  }).should("not.exist");
  cy.contains("canceled", {
    timeout: 60000,
  }).should("exist");
}
