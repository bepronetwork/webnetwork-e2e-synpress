import CreateBounty from "../pages/bounty/create-bounty";
import MainNav from "../pages/main-nav/main-nav";
import { faker } from "@faker-js/faker";
import userData from "../pages/payload/user";

const bountyForm = new CreateBounty();
const navActions = new MainNav();

let metamaskWalletAddress;

describe("Create bounty tests", () => {
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

    cy.intercept("GET", "/api/repos/branchs/1/bepro", [
      {
        branch: "main",
        protected: false,
      },
      {
        branch: "master",
        protected: false,
      },
    ]).as("getBranchs");

    cy.intercept("POST", "/api/search/users/address", [
      userData(metamaskWalletAddress),
    ]).as("userData");
    cy.visit("/");
    cy.wait(["@getRepos", "@getApi"]);
    navActions.connectBrowserWallet();
    navActions.acceptMetamaskAccessRequest();
    cy.waitFor("@userData");
    cy.get("span").contains("Create bounty").click();
    cy.url().should("contain", "bepro/create-bounty");
  });

  it(`Must create bounty with title, description, repository, branch and amount`, () => {
    bountyForm.getTitle().type(faker.random.words(6), { force: true });
    bountyForm.getDescription().type(faker.random.words(20));
    bountyForm.getRepository().type("{enter}{enter}");
    cy.wait("@getBranchs");
    bountyForm.getBranch().type("{enter}{enter}");
    bountyForm.getAmount().type(10);
    bountyForm.getButtonCreate().should("not.be.disabled").click();
    cy.confirmMetamaskTransaction();
    cy.intercept("POST", "/api/issue", {
      statusCode: 200,
    });
    cy.intercept("PATCH", "/api/issue").as("postDraftIssue");
    cy.wait("@postDraftIssue", {
      timeout: 100000,
    });
    cy.get("h1.text-capitalize").should("exist", {
      timeout: 10000,
    });
  });
});
