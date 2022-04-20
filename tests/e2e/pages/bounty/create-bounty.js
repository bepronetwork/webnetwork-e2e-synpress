import Page from "../page";
import { BranchsData } from "../payload/bounty";

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
    return cy.get(".react-select__input").last();
  }

  getAmount() {
    return cy.get("input.text-muted");
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

  cy.intercept("GET", "/api/repos/branchs/*/bepro", BranchsData).as(
    "getBranchs"
  );

  cy.intercept("PATCH", "/api/issue").as("postDraftIssue");

  cy.get("span").contains("Create bounty").click();
  cy.url().should("contain", "*/create-bounty");
  form.getTitle().type(title, { force: true });
  form.getDescription().type(description);
  form.getRepository().click({ force: true }).type("{enter}");
  cy.wait("@getBranchs");
  form.getBranch().click({ force: true }).type("{enter}");
  cy.wait(500);
  form.handleApprove();
  form.getAmount().type(amount);
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
  cy.wait("@postDraftIssue", {
    timeout: 100000,
  });
}
