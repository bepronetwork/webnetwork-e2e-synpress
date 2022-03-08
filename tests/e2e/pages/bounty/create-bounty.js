import Page from "../page";

export default class CreateBounty extends Page {
  getTitle() {
    return cy.get(".rounded-lg");
  }

  getDescription() {
    return cy.get("textarea");
  }

  getRepository() {
    return cy.get(".css-yk16xz-control");
  }

  getBranch() {
    return cy.get(".css-14jk2my-container");
  }

  getAmount() {
    return cy.get("input.text-muted");
  }

  getButtonCreate() {
    return cy.get("span").contains("Create Bounty");
  }
}
