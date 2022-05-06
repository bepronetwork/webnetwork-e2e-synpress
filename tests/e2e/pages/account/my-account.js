import Page from "../page";

export default class MyAccount extends Page {
  getOracles() {
    return cy.get(`a[href*="/bepro/account/my-oracles`);
  }

  getInputLock() {
    return cy.get(`input.border-radius-8[for="bepro-amount"]`);
  }

  getInputUnlock() {
    return cy.get(".col-md-5:nth-child(1) .form-control");
  }

  getButtonLockTransaction() {
    return cy.get("button.btn-purple > span").contains("Get");
  }

  getButtonUnlockTransaction() {
    return cy.get("button.btn-primary > span").contains("Get");
  }

  getButtonApprove() {
    return cy.get("button.btn-primary > span").contains("Approve");
  }

  handleApprove() {
    cy.get("div.gap-3")
      .find("button")
      .then(($buttons) => {
        if ($buttons.length === 2 && !$buttons[0].disabled) {
          $buttons[0].click();
          cy.wait(500);
          cy.confirmMetamaskPermissionToSpend();
        }
      });
  }

  getModalButtonConfirm() {
    return cy.get(".modal-footer > .btn-primary");
  }

  getButtonUnlock() {
    return cy.get("button > h4").contains("Unlock");
  }

  getInputDelegateAmount() {
    return cy.get(".col-md-5:nth-child(2) .input-group > .form-control");
  }

  getInputDelegateAddress() {
    return cy.get(".form-control:nth-child(2)");
  }

  getButtonDelegate() {
    return cy.get(".btn-purple > span").contains("Delegate");
  }



  
}
