import { CreateBounty } from "../pages/bounty/create-bounty";
import MainNav from "../pages/main-nav/main-nav";
import { faker } from "@faker-js/faker";
import { userData, userSessionData } from "../pages/payload/user";
import {
  UserBranchsData,
  Forksdata,
  ReposNetworkData,
  ReposUserData,
} from "../pages/payload/bounty";
import {
  Bounty,
  StartWorking,
  CreatePullRequest,
  recognizeAsFinished,
  CreateSimpleProposal,
} from "../pages/bounty/bounty";
import { Proposal, MergeProposalBounty } from "../pages/bounty/proposal";
import { interceptGroup } from "../pages/helpers/handleEqualIntercepts";

const bounty = new Bounty();
const navActions = new MainNav();
const proposal = new Proposal();

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

    cy.intercept("GET", "/api/auth/session", userSessionData).as("userSession");

    cy.intercept({
      method: "GET",
      url: "/api/issue/*/*/bepro",
      times: 5000,
    }).as("getIssueData");

    cy.visit("/");

    cy.wait(["@getRepos", "@getApi"]);

    navActions.handleConnectBrowserWallet();

    cy.wait(["@userData", "@userSession"]);
  });

  it("Should start working bounty", () => {
    CreateBounty({
      title: faker.random.words(2),
      description: faker.random.words(2),
      amount: "10",
      increaseTime: 24 * 60 * 61,
    });
    StartWorking();
  });

  it("Should create pull request bounty", () => {
    CreatePullRequest();
  });

  it("Should recognize as finished bounty", () => {
    recognizeAsFinished();
  });

  it("Should create proposal bounty", () => {
    bounty.getCreateProposalButton();
    CreateSimpleProposal({
      address: metamaskWalletAddress,
    });
    cy.wait(1000);
  });

  it("Should merge proposal bounty", () => {
    cy.get("span").contains("1 proposal").click({ force: true });
    cy.get(".content-wrapper > .cursor-pointer:nth-child(1)").click({
      force: true,
    });
    MergeProposalBounty(metamaskWalletAddress);
  });

  it("Should Redeem bounty", () => {
    cy.intercept("POST", "/api/search/users/address", [
      userData(metamaskWalletAddress),
    ]).as("userData");

    cy.intercept("GET", "/api/auth/session", userSessionData).as("userSession");

    cy.visit("bepro/create-bounty");
    cy.wait(["@userData", "@userSession"]);

    CreateBounty({
      title: faker.random.words(6),
      description: faker.random.words(6),
      amount: "10",
    });

    RedeemBounty();
  });
});
