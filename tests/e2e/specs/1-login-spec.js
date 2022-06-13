import MainNav from "../pages/main-nav/main-nav";
import MyAccount from "../pages/account/my-account";
import { userData, userSessionData } from "../pages/payload/user";

const mainNav = new MainNav();
const account = new MyAccount();

let metamaskWalletAddress;

describe("Wallet tests", () => {
  before(() => {
    mainNav.getMetamaskWalletAddress().then((address) => {
      metamaskWalletAddress = address;
      cy.log(address.slice(0, 4) + "..." + address.slice(-4));
    });

    cy.intercept("POST", "/api/search/users/address", [
      userData(metamaskWalletAddress),
    ]).as("userData");

    cy.intercept(
      "GET",
      "/api/auth/session",
      userSessionData(Cypress.env("acessToken"))
    ).as("userSession");

    cy.visit("/");

    cy.acceptMetamaskAccess();

    cy.wait(["@userData", "@userSession"]);
  });

  after(() => {
    cy.isMetamaskWindowActive().then((active) => {
      if (active === true) {
        cy.closeMetamaskWindow();
      }
    });
  });

  context("Connect metamask wallet and account tests", () => {
    it(`should login with success`, () => {
      // TODO add conditional that enables use of metamask when all tests are run

      //mainNav.acceptMetamaskAccessRequest();

      //mainNav.waitUntilLoggedIn();
      mainNav.getLoggedInWalletAddress().then((stakingWalletAddress) => {
        cy.log(stakingWalletAddress);
        const formattedMetamaskWalletAddress =
          metamaskWalletAddress.slice(0, 4) +
          "..." +
          metamaskWalletAddress.slice(-4);
        expect(stakingWalletAddress.toLowerCase()).to.equal(
          formattedMetamaskWalletAddress.toLowerCase()
        );
      });
    });

    it(`should lock $bepro account`, () => {
      mainNav.getAddressWallet().click({ force: true });
      cy.url().should("contain", "bepro/account");
      account.getOracles().click({ force: true });
      cy.url().should("contain", "bepro/account/my-oracles");
      cy.wait(500);
      account.getInputLock().type(150, { force: true });
      cy.wait(500);
      account.handleApprove();
      account.getButtonLockTransaction().click({ force: true });
      account.getModalButtonConfirm().click({ force: true });
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
    });

    it(`should unlock $bepro account`, () => {
      account.getButtonUnlock().click({ force: true });
      account.getInputUnlock().clear({ force: true }).type(100);
      account.getButtonUnlockTransaction().click({ force: true });
      account.getModalButtonConfirm().click({ force: true });
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
    });

    it(`should delegate oracles`, () => {
      account.getInputDelegateAmount().type(10, { force: true });
      account.getInputDelegateAddress().type(Cypress.env("delegationAddress"), { force: true });
      account.getButtonDelegate().click({ force: true });
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
      cy.wait(1000)
    });
  });
});
