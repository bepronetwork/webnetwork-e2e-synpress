import {
  UserBranchsData,
  Forksdata,
} from "../payload/bounty";

import { userData } from "../payload/user";

import { hasQueryName } from "../../utils/graphql-test-utils";


export const interceptGroup = {

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

  gqlForksQuery: (req) => {
    if (hasQueryName(req, "query Forks")) {
      req.alias = "gqlForksQuery";
      req.reply(({ body }) => {
        body.data ? (body.data = null) : null;
        body.data = Forksdata;
        return body;
      });
    }
  },

  gqlBranchesQuery: (req) => {
    if (hasQueryName(req, "query Branches")) {
      req.alias = "gqlBranchesQuery";
      req.reply(({ body }) => {
        body.data ? (body.data = null) : null;
        body.data = UserBranchsData;
        return body;
      });
    }
  },

  gqlRepositoriesQuery: (req) => {
    if (hasQueryName(req, "query Repositories")) {
      req.alias = "gqlRepositoriesQuery";
      req.reply(({ body }) => {
        body.data ? (body.data = null) : null;
        body.data = {
          user: {
            repositories: {
              pageInfo: {
                endCursor: "Y3Vyc29yOnYyOpHOG9_rrw==",
                hasNextPage: false,
              },
              nodes: [
                {
                  name: "bepro-js-edge",
                  nameWithOwner: "user-test/bepro-js-edge",
                  isFork: true,
                  owner: {
                    login: "user-test",
                  },
                },
              ],
            },
            organizations: {
              nodes: [],
            },
          },
        };
        return body;
      });
    }
  },

  gqlCommentsQuery: (req) => {
    if (hasQueryName(req, "query Comments")) {
      req.alias = "gqlCommentsQuery";
      req.reply(({ body }) => {
        body.data ? (body.data = null) : null;
        body.data = {
          repository: {
            issueOrPullRequest: {
              comments: {
                pageInfo: {
                  endCursor: null,
                  hasNextPage: false,
                },
                nodes: [],
              },
            },
          },
        };
        return body;
      });
    }
  },

  gqlDetailsQuery: (req) => {
    if (hasQueryName(req, "query Details")) {
      req.alias = "gqlDetailsQuery";
      req.reply({
        data: {
          repository: {
            pullRequest: {
              id: "PR_kwDOGEZRks45NP5H",
              mergeable: "MERGEABLE",
              merged: false,
              state: "OPEN",
            },
          },
        },
      });
    }
  },

  gqlParticipantsQuery: (req) => {
    if (hasQueryName(req, "query Participants")) {
      req.alias = "gqlParticipantsQuery";
      req.reply({
        data: {
          repository: {
            pullRequest: {
              participants: {
                pageInfo: {
                  endCursor: "Mg",
                  hasNextPage: false,
                },
                nodes: [
                  {
                    login: "user-test",
                  },
                ],
              },
            },
          },
        },
      });
    }
  },

  gqlLinesOfCodeQuery: (req) => {
    if (hasQueryName(req, "query LinesOfCode")) {
      req.alias = "gqlLinesOfCodeQuery";
      req.reply({
        data: {
          repository: {
            pullRequest: {
              additions: 2,
              deletions: 1,
            },
          },
        },
      });
    }
  },
};
