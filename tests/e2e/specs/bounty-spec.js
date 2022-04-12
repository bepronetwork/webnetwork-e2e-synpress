import { FormBounty, CreateBounty } from "../pages/bounty/create-bounty";
import MainNav from "../pages/main-nav/main-nav";
import { faker } from "@faker-js/faker";
import { userData, userSessionData } from "../pages/payload/user";
import {
  UserBranchsData,
  UserReposData,
  BranchsData,
  Forksdata,
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

    cy.intercept("GET", "/api/repos?networkName=bepro", [
      {
        id: 1,
        githubPath: "bepronetwork/bepro-js-edge",
        network_id: 1,
      },
    ]).as("getRepos");

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

  beforeEach(() => {
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
      UserReposData
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
  })

  it("Should start working bounty", () => {
    // transformar toda lógica em 1 it só, criar 2 PR ou 2 proposals para dispute e merge.
    // mapear os intercept que se repetem e mudar os nomes dos intercepts 
    CreateBounty({
      title: faker.random.words(2),
      description: faker.random.words(2),
      amount: "10",
      increaseTime: 24 * 60 * 61,
    });

    cy.wait(["@getForks", "@getUserBranchs", "@getUserRepos", "@getComments"]);

    cy.contains("Start Working", {
      timeout: 60000,
    })
      .should("exist")
      .click({ force: true });

    cy.wait(["@getIssueData"]);
    bounty.waitForTransactionSuccess();

    cy.contains("Start Working", {
      timeout: 60000,
    }).should("not.exist");

    cy.contains("Create Pull Request", {
      timeout: 60000,
    }).should("exist");

  });

  it("Should create pull request bounty", () => {
    cy.intercept(
      {
        method: "POST",
        url: "/api/pull-request",
        times: 2000,
      },
      {
        body: "ok",
      }
    ).as("postPullRequest");

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
      {
        owner: {
          login: "user-test",
        },
        fork: true,
      }
    ).as("getUserRepos");

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
          body.pullRequests = [
            {
              branch: "bounty_46",
              createdAt: body.createdAt,
              githubId: "1181",
              githubLogin: "user-test",
              id: 3,
              issueId: 284,
              reviewers: [],
              updatedAt: "2022-03-30T14:02:57.131Z",
            },
          ];
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
        body: {
          state: "open",
          mergeable: false,
          mergeable_state: "dirty",
          merged: false,
        },
      }
    ).as("getPrGithub");

    cy.intercept("GET", "/api/pull-request?*", {
      count: 1,
    }).as("getPrCount");

    bounty.getCreatePullRequestButton().click();
    cy.get("h3").contains("Create Pull Request").should("exist");
    cy.get(".react-select__input").click({ force: true }).type("{enter}");
    cy.get("span").contains("Create Pull Request").click({ force: true });
    cy.wait("@postPullRequest");
    cy.wait([
      "@getComments",
      "@getUserRepos",
      "@getIssuePrData",
      "@getPrGithub",
      "@getPrCount",
    ]);
    bounty.waitForTransactionSuccess();
  });

  it("Should recognize as finished bounty", () => {
    cy.intercept(
      {
        method: "POST",
        url: "/api/pull-request",
        times: 2000,
      },
      {
        body: "ok",
      }
    ).as("postPullRequest");

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
      {
        owner: {
          login: "user-test",
        },
        fork: true,
      }
    ).as("getUserRepos");

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
          body.pullRequests = [
            {
              branch: "bounty_46",
              createdAt: body.createdAt,
              githubId: "1181",
              githubLogin: "user-test",
              id: 3,
              issueId: 284,
              reviewers: [],
              updatedAt: "2022-03-30T14:02:57.131Z",
            },
          ];
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
        body: {
          state: "open",
          mergeable: true,
          mergeable_state: "dirty",
          merged: false,
        },
      }
    ).as("getPrGithub");

    cy.intercept("GET", "/api/pull-request?*", {
      count: 1,
    }).as("getPrCount");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/pulls/*/commits",
        hostname: "api.github.com",
      },
      {
        body: [
          {
            author: {
              login: "user-test",
            },
          },
        ],
      }
    ).as("getParticipants");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/commits",
        hostname: "api.github.com",
      },
      {
        body: [
          {
            author: {
              login: "user-test",
            },
          },
        ],
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
      "@getComments",
      "@getUserRepos",
      "@getIssuePrData",
      "@getPrGithub",
      "@getPrCount",
      "@getParticipants",
      "@searchUsers",
    ]);
    cy.wait(1000);
  });

  //commits default
  //login default
  //BEPRO have a mergeProposals =
  /* 
  {
    createdAt: "2022-03-31T16:07:41.687Z"
    githubLogin: "MarcusviniciusLsantos",
    id: 1,
    issueId: 324,
    pullRequestId: 5,
    scMergeId: "2",
    updatedAt: "2022-03-31T16:07:41.687Z"
  }
  */

  //after lunch, go continue mapping intercepts and verify poll to Reedem issue how base
  //fazer o do BEPRO  e testar, olhar nome do button create proposal 2

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
            {
              createdAt: body.createdAt,
              githubLogin: "user-test",
              id: 1,
              issueId: body.issueId,
              pullRequestId: 3,
              scMergeId: "0",
              updatedAt: "2022-03-31T16:07:41.687Z",
            },
          ];
          body.pullRequests = [
            {
              branch: "main",
              createdAt: "2022-03-30T14:02:57.131Z",
              githubId: "1181",
              githubLogin: "user-test",
              id: 3,
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
        body: {
          state: "open",
          mergeable: true,
          mergeable_state: "dirty",
          merged: false,
          stats: {
            total: 1,
          },
        },
      }
    ).as("getPrGithub");

    cy.intercept(
      {
        method: "GET",
        url: "/repos/bepronetwork/bepro-js-edge/pulls/*/commits",
        hostname: "api.github.com",
      },
      {
        body: [
          {
            author: {
              login: "user-test",
            },
          },
          {
            author: {
              login: "user2-test",
            },
          },
        ],
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
      {
        owner: {
          login: "user-test",
        },
        fork: true,
      }
    ).as("getCurrentRepo");

    cy.contains("Create Proposal").click({ force: true });
    //cy.wait(1000000)
    //cy.wait("@getAddress")
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
    ]);
    cy.contains("1 proposal", {
      timeout: 500000,
    });
    cy.get("label.text-primary").contains("validation & disputes");
    cy.wait(2000);
  });

  /*it("Should merge proposal bounty", () => {
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

    cy.get("span").contains("1 proposal").click({ force: true });
    cy.get(".content-wrapper > .cursor-pointer").click({ force: true });
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
  });*/

  //Desenhar o fluxo geral Login|lock 25m bounty|create|start working|create pr|create proposal|merge and dispute
  it("Should dispute proposal bounty", () => {
    cy.intercept("POST", "/api/search/users/address", {
      statusCode: 200,
      body: [userData(metamaskWalletAddress)],
    }).as("getAddress");

    cy.intercept("POST", "/api/past-events/dispute-proposal", {
      statusCode: 200,
    }).as("disputeProposal");

    cy.get("span").contains("1 proposal").click({ force: true });
    cy.get(".content-wrapper > .cursor-pointer").click({ force: true });
    cy.wait("@getAddress");
    cy.wait(500);
    cy.get("button").contains("Dispute").click();
    cy.wait(500);
    cy.confirmMetamaskTransaction({});
    cy.wait("@disputeProposal");
    bounty.waitForTransactionSuccess();
    cy.contains("Failed", {
      timeout: 500000,
    });
    cy.wait("@getAddress");
  });

  it("Should Redeem bounty", () => {
    //cy.get(".bg-shadow:nth-child(1) .h4").click({ force: true });
    //cy.wait(1000);
    //cy.wait(["@getForks", "@getUserBranchs", "@getUserRepos", "@getComments"]);

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
      UserReposData
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
