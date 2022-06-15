import Page from "../page";

export class FormBounty extends Page {
  getTitle() {
    return cy.get(".rounded-lg");
  }

  getDescription() {
    return cy.get("textarea");
  }

  getRepository() {
    return cy.get(".react-select__input").first();
  }

  getBranch() {
    return cy.get("div > label").contains("Select a branch").next()
  }

  getToken() {
    return cy.get(".react-select__input").last();
  }

  getAmount() {
    return cy.get(`input[inputmode="numeric"]`);
  }

  getButtonCreate() {
    return cy.get("span").contains("Create Bounty");
  }

  getButtonApprove() {
    return cy.get("button").contains("Approve");
  }

  handleApprove() {
    cy.get(".content-wrapper > .mt-4")
      .find("button")
      .then(($buttons) => {
        if ($buttons.length === 2) {
          $buttons[0].click();
          cy.wait(500);
          cy.confirmMetamaskPermissionToSpend();
        }
      });
  }
}

export function CreateBounty({
  title = "",
  description = "",
  amount = "",
  increaseTime = 0,
}) {
  const form = new FormBounty();

  cy.intercept("POST", "/api/past-events/bounty/created").as("created");

  cy.get("span").contains("Create bounty").click();
  cy.url();
  form.getTitle().type(title, { force: true });
  form.getDescription().type(description);
  form.getRepository().click({ force: true }).type("{enter}");
  cy.wait("@gqlBranchesQuery");
  form.getBranch().click({ force: true }).type("{enter}");
  form.getToken().click({ force: true }).type("{enter}");
  form.getAmount().type(amount);
  cy.wait(500);
  form.handleApprove();
  form.getButtonCreate().should("not.be.disabled").click();
  cy.intercept("POST", "/api/issue");
  cy.wait(500);
  cy.confirmMetamaskTransaction({}).then(() => {
    if (increaseTime > 0) {
      cy.request("POST", "http://localhost:3005/increaseTime", {
        time: increaseTime,
      });
    }
  });
  cy.wait("@created", {
    timeout: 100000,
  });
}
