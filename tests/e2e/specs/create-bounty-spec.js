import CreateBounty from "../pages/bounty/create-bounty";
import MainNav from "../pages/main-nav/main-nav";
import faker from "faker";

const bountyForm = new CreateBounty();
const navActions = new MainNav();

describe("Create bounty tests", () => {
  before(() => {
    cy.fetchMetamaskWalletAddress().then((address) => {
      cy.log(address);
    });
    cy.visit("/");
    navActions.connectBrowserWallet();
    navActions.acceptMetamaskAccessRequest();
    cy.get("span").contains("Create bounty").click();
    cy.wait(5000);
  });

  it(`Must create bounty with title, description, repository, branch and amount`, () => {
    bountyForm.getTitle().type(faker.random.words(6), { force: true });
    bountyForm.getDescription().type(faker.random.words(20));
    bountyForm.getRepository().type("{enter}{enter}");
    bountyForm.getBranch().type("{enter}{enter}");
    bountyForm.getAmount().type(10);
    bountyForm.getButtonCreate().should("not.be.disabled").click();
    cy.wait(2000);
    cy.confirmMetamaskTransaction();
    cy.intercept("POST", "/api/issue", {
      statusCode: 200,
    });
    cy.intercept("PATCH", "/api/issue").as("postDraftIssue");
    cy.wait("@postDraftIssue", {
      timeout: 100000,
    });
    cy.wait(10000);
    cy.get("h1.text-capitalize").should("exist");
  });
});
