export default class Page {
  getTitle() {
    return cy.title();
  }

  getMetamaskWalletAddress() {
    return cy.fetchMetamaskWalletAddress();
  }

  acceptMetamaskAccessRequest() {
    cy.acceptMetamaskAccess();
  }

  confirmMetamaskTransaction() {
    cy.confirmMetamaskTransaction();
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
}
