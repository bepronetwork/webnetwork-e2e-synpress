import Page from "../page";
import { interceptGroup } from "../helpers/handleEqualIntercepts";
import { Bounty } from "./bounty";
import { FirstProposalData, SecondPrData } from "../payload/bounty";
import { faker } from "@faker-js/faker";

export class Proposal extends Page {
  getReadyToMergePr() {
    return cy.get("span").contains("Ready to merge");
  }
  getDistributionInput() {
    return cy.get(`input.border-radius-8[inputmode="numeric"]`);
  }
  getCreateButton() {
    return cy.get(".modal-footer > .btn-primary");
  }
}

export function CreateSimpleProposal(address) {
  const proposal = new Proposal();

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
        body.mergeProposals = [FirstProposalData(body.issueId, faker.date.past(1))];
        body.pullRequests = [
          SecondPrData(body.issueId, body.createdAt),
          {
            branch: "bounty_47",
            createdAt: body.createdAt,
            githubId: "1",
            githubLogin: "user-test2",
            id: 50,
            issueId: body.issueId,
            reviewers: [],
            updatedAt: "2022-03-30T14:02:57.131Z",
          },
        ];
        return body;
      });
    }
  ).as("getIssuePrData");

  interceptGroup.searchUsers(address);

  cy.intercept("POST", "/api/past-events/merge-proposal", {
    statusCode: 200,
  }).as("mergeProposal");

  proposal.getReadyToMergePr().should("exist");
  proposal.getDistributionInput().clear().type("100");
  cy.contains("Distribution is 100%").should("exist");
  proposal.getCreateButton().click();
  cy.confirmMetamaskTransaction({});
  cy.wait([
    "@getIssuePrData",
    "@searchUsers",
  ]);

  cy.contains("1 proposal", {
    timeout: 500000,
  });

  cy.get("label.text-primary").contains("validation & disputes");
}

export function MergeProposalBounty() {
  const bounty = new Bounty();

  cy.intercept("POST", "/api/pull-request/merge", {
    statusCode: 200,
  }).as("mergePr");

  cy.intercept("POST", "/api/past-events/close-issue", {
    statusCode: 200,
  }).as("closeIssue");

  cy.contains("Open for Dispute").should("exist");
  cy.get("div.justify-content-between > button").first().click();
  cy.wait(500);
  /* todo: fix this merge confirmation logic */
  /*cy.get(".modal-footer > button").click();
  cy.confirmMetamaskTransaction({});
  cy.wait(["@mergePr", "@closeIssue"]);
  bounty.waitForTransactionSuccess();
  cy.waitUntil(
    () =>
      cy
        .contains("Pull Request merged", {
          timeout: 60000,
        })
        .should("exist"),
    {
      timeout: 60000,
    }
  );*/
}
