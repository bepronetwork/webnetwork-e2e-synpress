import {
  UserBranchsData,
  Forksdata,
  ReposNetworkData,
  ReposUserData,
  FirstPrData,
  StatusPrGithubData,
  PrCommitsGithubData,
  FirstProposalData,
  SecondProposalData,
} from "../payload/bounty";

import { userData, userSessionData } from "../pages/payload/user";

const hostGithub = "api.github.com";

export const interceptGroup = {
  getGithubForks: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/forks?per_page=100",
        hostname: hostGithub,
      },
      {
        statusCode: 200,
        body: Forksdata,
      }
    )
    .as("getGithubForks"),

  getGithubCurrentBranchs: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/branches",
        hostname: hostGithub,
      },
      UserBranchsData
    )
    .as("getGithubCurrentBranchs"),

  getGithubCurrentRepos: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*",
        hostname: hostGithub,
      },
      ReposUserData
    )
    .as("getGithubCurrentRepos"),

  getIssueCommentsGithub: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/issues/*/comments",
        hostname: hostGithub,
      },
      {
        statusCode: 200,
        body: [],
      }
    )
    .as("getIssueCommentsGithub"),

  postPullRequest: cy
    .intercept(
      {
        method: "POST",
        url: "/api/pull-request",
        times: 2000,
      },
      {
        body: "ok",
      }
    )
    .as("postPullRequest"),

  getPrCount: cy
    .intercept("GET", "/api/pull-request?*", {
      count: 1,
    })
    .as("getPrCount"),

  getPrGithub: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/pulls/*",
        hostname: "api.github.com",
      },
      {
        body: StatusPrGithubData,
      }
    )
    .as("getPrGithub"),

  getParticipants: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/pulls/*/commits",
        hostname: "api.github.com",
      },
      {
        body: [PrCommitsGithubData],
      }
    )
    .as("getParticipants"),

  getCommits: cy
    .intercept(
      {
        method: "GET",
        url: "/repos/*/*/commits",
        hostname: "api.github.com",
      },
      {
        body: [PrCommitsGithubData],
      }
    )
    .as("getCommits"),

  searchUsers: (address) =>
    cy
      .intercept("POST", "/api/search/users/login", {
        statusCode: 200,
        body: [userData(address)],
      })
      .as("searchUsers"),

  getAddress: (address) =>
    cy
      .intercept("POST", "/api/search/users/address", {
        statusCode: 200,
        body: [userData(address)],
      })
      .as("getAddress"),
};
