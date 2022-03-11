import MainNav from "../pages/main-nav/main-nav";
import MyAccount from "../pages/account/my-account";
import { faker } from "@faker-js/faker";
import userData from "../pages/payload/user";

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

    cy.visit("/");
  });

  context("Connect metamask wallet and account tests", () => {
    it(`should login with success`, () => {
      // TODO add conditional that enables use of metamask when all tests are run
      mainNav.connectBrowserWallet();
      //mainNav.acceptMetamaskAccessRequest();
      cy.wait("@userData");
      //mainNav.waitUntilLoggedIn();
      cy.wait(500);
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
      mainNav.getAddressWallet().click();
      cy.url().should("contain", "bepro/account");
      account.getOracles().click({ force: true });
      cy.url().should("contain", "bepro/account/my-oracles");
      account.getInputLock().type(100);
      account.getButtonLockTransaction().click();
      account.getModalButtonConfirm().click();
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
    });

    it(`should unlock $bepro account`, () => {
      account.getButtonUnlock().click({ force: true });
      account.getInputUnlock().clear().type(100);
      account.getButtonUnlockTransaction().click();
      account.getModalButtonConfirm().click();
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
    });

    it(`should delegate oracles`, () => {
      account.getInputDelegateAmount().type(10);
      account.getInputDelegateAddress().type(Cypress.env("delegationAddress"));
      account.getButtonDelegate().click({ force: true });
      cy.wait(500);
      account.confirmMetamaskTransaction();
      mainNav.waitForTransactionSuccess();
    });
  });
});
