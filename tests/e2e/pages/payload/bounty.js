const Forksdata = {
  repository: {
    forks: {
      pageInfo: {
        endCursor: "Y3Vyc29yOnYyOpHOHRNkNw==",
        hasNextPage: false,
      },
      nodes: [
        {
          owner: {
            login: "user-1",
          },
        },
        {
          owner: {
            login: "user-2",
          },
        },
        {
          owner: {
            login: "user-test",
          },
        },
      ],
    },
  },
};

const UserBranchsData = {
  repository: {
    refs: {
      nodes: [{ name: "main" }, { name: "master" }],
      pageInfo: { endCursor: "Nw", hasNextPage: false },
    },
  },
};

const ReposNetworkData = [
  {
    id: 1,
    githubPath: "bepronetwork/bepro-js-edge",
    network_id: 1,
  },
];

const ResponsePrData = {
  bountyId: 30,
  originRepo: "bepronetwork/bepro-js-edge",
  originBranch: "bounty_1-414",
  originCID: "1/1539",
  userRepo: "user-test/bepro-js-edge",
  userBranch: "user-test:feature/test6",
  cid: "1540",
};

const FirstPrData = (issueId, createdAt) => ({
  branch: "bounty_46",
  createdAt,
  githubId: "1181",
  githubLogin: "user-test",
  id: 3,
  issueId,
  reviewers: [],
  updatedAt: "2022-03-30T14:02:57.131Z",
  contractId: 0,
  branch: "user-test:feature/test7",
  status: "draft",
  userBranch: "user-test:feature/test7",
  userRepo: "user-test/bepro-js-edge",
});

const SecondPrData = (issueId, createdAt) => ({
  branch: "bounty_46",
  createdAt,
  githubId: "1181",
  githubLogin: "user-test",
  id: 3,
  issueId,
  reviewers: [],
  updatedAt: "2022-03-30T14:02:57.131Z",
  contractId: 0,
  branch: "user-test:feature/test7",
  status: "ready",
  userBranch: "user-test:feature/test7",
  userRepo: "user-test/bepro-js-edge",
});

const FirstProposalData = (issueId, createdAt) => ({
  createdAt,
  githubLogin: "user-test",
  id: 1,
  issueId,
  pullRequestId: 3,
  scMergeId: "0",
  updatedAt: "2022-03-31T16:07:41.687Z",
  contractId: 0,
});

const SecondProposalData = (issueId, createdAt) => ({
  createdAt,
  githubLogin: "user-test2",
  id: 2,
  issueId,
  pullRequestId: 50,
  scMergeId: "0",
  updatedAt: "2022-03-31T16:07:41.687Z",
  contractId: 0,
});

export {
  Forksdata,
  UserBranchsData,
  ReposNetworkData,
  FirstPrData,
  SecondPrData,
  FirstProposalData,
  SecondProposalData,
  ResponsePrData,
};
