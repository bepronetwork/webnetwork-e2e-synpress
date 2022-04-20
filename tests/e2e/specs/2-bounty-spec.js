import { CreateBounty } from "../pages/bounty/create-bounty";
import { StartWorking, CreatePullRequest } from "../pages/bounty/bounty";
import MainNav from "../pages/main-nav/main-nav";
import { faker } from "@faker-js/faker";
import { userData, userSessionData } from "../pages/payload/user";
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
} from "../pages/payload/bounty";
import Bounty from "../pages/bounty/bounty";

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

    cy.intercept("GET", "/api/auth/session", userSessionData).as("userSession");

    cy.intercept({
      method: "GET",
      url: "/api/issue/*/*/bepro",
      times: 5000,
    }).as("getIssueData");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/issues/*/comments",
        hostname: "api.github.com",
      },
      {
        statusCode: 200,
        body: [],
      }
    ).as("getGithubComments");

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
          body.mergeProposals = [
            FirstProposalData(body.issueId, body.createdAt),
          ];
          body.pullRequests = [
            FirstPrData(body.issueId, body.createdAt),
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

    cy.intercept("POST", "/api/past-events/merge-proposal", {
      statusCode: 200,
    }).as("mergeProposal");

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
        url: "/repos/bepronetwork/bepro-js-edge/issues/*/comments",
        hostname: "api.github.com",
      },
      {
        statusCode: 200,
        body: [],
      }
    ).as("getComments");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/user-test/bepro-js-edge",
        hostname: "api.github.com",
      },
      ReposUserData
    ).as("getCurrentRepo");

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
    cy.contains("Create Proposal").click({ force: true });
    cy.get("span").contains("ready to merge").should("exist");
    cy.get(`input.border-radius-8[inputmode="numeric"]`).clear().type("100");
    cy.contains("Distribution is 100%").should("exist");
    cy.get(".modal-footer > .btn-primary").click();
    cy.confirmMetamaskTransaction({});
    cy.wait([
      "@getCurrentRepo",
      "@getParticipants",
      "@getComments",
      "@getPrGithub",
      "@getIssuePrData",
      "@mergeProposal",
      "@searchUsers",
    ]);
    cy.contains("1 proposal", {
      timeout: 500000,
    });
    cy.get("label.text-primary").contains("validation & disputes");

    cy.intercept("POST", "/api/search/users/login", {
      statusCode: 200,
      body: [
        userData(Cypress.env("delegationAddress"), "user-test2", "second user"),
      ],
    }).as("searchUsers2");

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
          body.mergeProposals = [
            FirstProposalData(body.issueId, body.createdAt),
            SecondProposalData(body.issueId, body.createdAt),
          ];
          body.pullRequests = [
            FirstPrData(body.issueId, body.createdAt),
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
    ).as("getIssuePrData2");

    cy.contains("Create Proposal").click({ force: true });
    cy.wait("@getCommits");
    cy.get("div.react-select__dropdown-indicator").click({ force: true });
    cy.wait(500);
    cy.get(".proposal__select-options:nth-child(2)").click({ force: true });
    cy.wait(["@searchUsers2", "@getParticipants", "@getComments"]);
    cy.get("span").contains("ready to merge").should("exist");
    cy.get(`input.border-radius-8[inputmode="numeric"]`).clear().type("100");
    cy.contains("Distribution is 100%").should("exist");
    cy.get(".modal-footer > .btn-primary").click();
    cy.confirmMetamaskTransaction({});
    cy.wait([
      "@getCurrentRepo",
      "@getParticipants",
      "@getComments",
      "@getPrGithub",
      "@getIssuePrData2",
      "@mergeProposal",
    ]);
    cy.contains("2 proposals", {
      timeout: 500000,
    });

    cy.wait(2000);
  });

  it("Should merge proposal bounty", () => {
    cy.intercept("POST", "/api/search/users/address", {
      statusCode: 200,
      body: [userData(metamaskWalletAddress)],
    }).as("getAddress");
    cy.intercept("POST", "/api/pull-request/merge", {
      statusCode: 200,
    }).as("mergePr");
    cy.intercept("POST", "/api/past-events/close-issue", {
      statusCode: 200,
    }).as("closeIssue");

    cy.get("span").contains("2 proposals").click({ force: true });
    cy.get(".content-wrapper > .cursor-pointer:nth-child(1)").click({
      force: true,
    });
    cy.wait("@getAddress");
    cy.get("button").contains("Merge").click();
    cy.wait(500);
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
    );
  });

  it("Should Redeem bounty", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/forks?per_page=100",
        hostname: "api.github.com",
      },
      {
        statusCode: 200,
        body: Forksdata,
      }
    ).as("getForks");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/user-test/bepro-js-edge/branches",
        hostname: "api.github.com",
      },
      UserBranchsData
    ).as("getUserBranchs");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/user-test/bepro-js-edge",
        hostname: "api.github.com",
      },
      {
        body: ReposUserData,
      }
    ).as("getUserRepos");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/issues/*/comments",
        hostname: "api.github.com",
      },
      {
        statusCode: 200,
        body: [],
      }
    ).as("getComments");

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

    cy.contains("Redeem", {
      timeout: 60000,
    });

    bounty.getRedeemButton().click();
    cy.wait(1000);
    cy.isMetamaskWindowActive();
    cy.wait(1000);
    cy.confirmMetamaskTransaction({});
    //cy.wait(["@getComments", "@getUserRepos", "@getIssueData"]);
    cy.contains("Redeem", {
      timeout: 60000,
    }).should("not.exist");
    cy.contains("canceled", {
      timeout: 60000,
    }).should("exist");
  });
});
