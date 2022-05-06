import Page from "../page";

export default class MainNav extends Page {
  getAddressWallet() {
    return cy.get(`a[href*="/bepro/account"] > .text-right`);
  }

  findAddressWallet() {
    return cy.find(".text-right > .mb-1");
  }

  handleConnectBrowserWallet() {
    cy.get(".flex-row > .flex-row")
      .find("button")
      .then(($buttons) => {
        if ($buttons.length === 2) {
          cy.get("button").contains("Connect").click();
          cy.acceptMetamaskAccess()
        }
      });
  }

  waitUntilLoggedIn() {
    cy.waitUntil(() => {
      const addressWallet = cy.get(".text-right > .mb-1");
      return addressWallet.should("exist");
    });
    // waiting for wallet button is not enough in rare cases to be logged in
    cy.wait(2000);
  }

  getLoggedInWalletAddress() {
    return cy.get(".text-right > .mb-1").invoke("text");
  }
}
