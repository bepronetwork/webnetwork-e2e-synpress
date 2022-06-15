import { CreateBounty } from "../pages/bounty/create-bounty";
import MainNav from "../pages/main-nav/main-nav";
import { faker } from "@faker-js/faker";
import { userData, userSessionData } from "../pages/payload/user";
import { ReposNetworkData } from "../pages/payload/bounty";
import {
  Bounty,
  StartWorking,
  CreatePullRequest,
  recognizeAsFinished,
  RedeemBounty,
} from "../pages/bounty/bounty";
import {
  MergeProposalBounty,
  CreateSimpleProposal,
} from "../pages/bounty/proposal";

import { interceptGroup } from "../pages/helpers/handleEqualIntercepts";

const bounty = new Bounty();
const navActions = new MainNav();

let metamaskWalletAddress;

describe("Bounty tests", () => {
  before(() => {
    cy.fetchMetamaskWalletAddress().then((address) => {
      metamaskWalletAddress = address;
      cy.log(address.slice(0, 4) + "..." + address.slice(-4));
    });

    cy.intercept("GET", "/api/repos?networkName=bepro", ReposNetworkData).as(
      "getRepos"
    );

    cy.intercept("GET", "/api/ip", {
      countryCode: "PT",
    }).as("getApi");

    cy.intercept("POST", "/api/search/users/address", [
      userData(metamaskWalletAddress),
    ]).as("userData");

    cy.intercept(
      "GET",
      "/api/auth/session",
      userSessionData(Cypress.env("acessToken"))
    ).as("userSession");

    cy.intercept({
      method: "GET",
      url: "/api/issue/*/*/bepro",
      times: 5000,
    }).as("getIssueData");

    cy.visit("/");

    cy.wait(["@getRepos", "@getApi", "@userSession"]);

    cy.isMetamaskWindowActive().then((active) => {
      if (active === true) {
        cy.acceptMetamaskAccess();
        cy.wait(["@userData"]);
      }
    });

  });

  it("Should start working bounty", () => {

    cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlBranchesQuery(req);
      interceptGroup.gqlForksQuery(req);
      interceptGroup.gqlCommentsQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
    });

    CreateBounty({
      title: faker.random.words(2),
      description: faker.random.words(2),
      amount: "10",
      increaseTime: 24 * 60 * 61,
    });

    cy.wait([
      "@gqlBranchesQuery",
      "@gqlForksQuery",
      "@gqlCommentsQuery",
      "@gqlRepositoriesQuery",
    ]);

    cy.reload();

    StartWorking();
  });

  it("Should create pull request bounty", () => {
    cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlBranchesQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
      interceptGroup.gqlDetailsQuery(req);
    });
    CreatePullRequest();
  });

  it("Should recognize as finished bounty", () => {
    cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlCommentsQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
      interceptGroup.gqlDetailsQuery(req);
      interceptGroup.gqlLinesOfCodeQuery(req);
      interceptGroup.gqlParticipantsQuery(req);
    });
    recognizeAsFinished(metamaskWalletAddress);
    cy.wait([
      "@gqlParticipantsQuery",
      "@gqlLinesOfCodeQuery",
      "@gqlRepositoriesQuery",
    ]);
  });

  it("Should create proposal bounty", () => {
    cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlParticipantsQuery(req);
      interceptGroup.gqlCommentsQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
      interceptGroup.gqlDetailsQuery(req);
      interceptGroup.gqlLinesOfCodeQuery(req);
    });
    cy.wait(500);
    cy.contains("Create Proposal").should("exist");
    bounty.getCreateProposalButton().click({ force: true });
    CreateSimpleProposal(metamaskWalletAddress);
  });

  it("Should merge proposal bounty", () => {
    /*cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlBranchesQuery(req);
      interceptGroup.gqlForksQuery(req);
      interceptGroup.gqlCommentsQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
      interceptGroup.gqlDetailsQuery(req);
      interceptGroup.gqlLinesOfCodeQuery(req);
      interceptGroup.gqlParticipantsQuery(req);
    });*/
    interceptGroup.getAddress(metamaskWalletAddress);
    cy.get("span").contains("1 proposal").click({ force: true });
    cy.get(".content-wrapper > .cursor-pointer:nth-child(1)").click({
      force: true,
    });
    cy.wait("@getAddress");
    MergeProposalBounty();
  });

  it("Should Redeem bounty", () => {
    cy.intercept("POST", "https://api.github.com/graphql", (req) => {
      interceptGroup.gqlBranchesQuery(req);
      interceptGroup.gqlForksQuery(req);
      interceptGroup.gqlCommentsQuery(req);
      interceptGroup.gqlRepositoriesQuery(req);
    });

    cy.intercept("POST", "/api/search/users/address", [
      userData(metamaskWalletAddress),
    ]).as("userData");

    cy.intercept(
      "GET",
      "/api/auth/session",
      userSessionData(Cypress.env("acessToken"))
    ).as("userSession");

    cy.visit("bepro/create-bounty");
    cy.wait(["@userData", "@userSession"]);

    CreateBounty({
      title: faker.random.words(6),
      description: faker.random.words(6),
      amount: "10",
    });

    cy.wait([
      "@gqlBranchesQuery",
      "@gqlForksQuery",
      "@gqlCommentsQuery",
      "@gqlRepositoriesQuery",
    ]);

    RedeemBounty();
  });
});
