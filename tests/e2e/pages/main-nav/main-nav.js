import Page from "../page";

export default class MainNav extends Page {
  getAddressWallet() {
    return cy.get(".text-right > .mb-1");
  }

  findAddressWallet() {
    return cy.find(".text-right > .mb-1");
  }

  connectBrowserWallet() {
    cy.get("button").contains("Connect").click();
  }

  getconnectBrowserWallet() {
    return cy.get("button").contains("Connect");
  }

  waitUntilLoggedIn() {
    cy.waitUntil(() => {
      const addressWallet = cy.get(".text-right > .mb-1");
      return addressWallet.should("exist");
    });
    // waiting for wallet button is not enough in rare cases to be logged in
    cy.wait(2000);
  }

  waitForTransactionSuccess() {
    cy.waitUntil(
      () =>
        cy
          .contains("Success", {
            timeout: 60000,
          })
          .should("exist"),
      {
        timeout: 60000,
      }
    );
  }

  getLoggedInWalletAddress() {
    return cy.get(".text-right > .mb-1").invoke("text");
  }
}
