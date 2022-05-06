const Forksdata = [
  {
    id: 451920531,
    name: "bepro-js-edge",
    full_name: "luisclark/bepro-js-edge",
    owner: {
      login: "luisclark",
      id: 92887398,
      avatar_url: "https://avatars.githubusercontent.com/u/92887398?v=4",
      url: "https://api.github.com/users/luisclark",
      type: "User",
    },
    url: "https://api.github.com/repos/luisclark/bepro-js-edge",
  },
];

const UserBranchsData = [
  {
    name: "main",
  },
  {
    name: "master",
  },
];

const BranchsData = [
  {
    branch: "main",
    protected: false,
  },
  {
    branch: "master",
    protected: false,
  },
];

const ReposNetworkData = [
  {
    id: 1,
    githubPath: "bepronetwork/bepro-js-edge",
    network_id: 1,
  },
];

const ReposUserData = {
  owner: {
    login: "user-test",
  },
  fork: true,
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
});

const StatusPrGithubData = {
  state: "open",
  mergeable: true,
  mergeable_state: "dirty",
  merged: false,
};

const PrCommitsGithubData = {
  author: {
    login: "user-test",
  },
};

const FirstProposalData = (issueId, createdAt) => ({
  createdAt,
  githubLogin: "user-test",
  id: 1,
  issueId,
  pullRequestId: 3,
  scMergeId: "0",
  updatedAt: "2022-03-31T16:07:41.687Z",
});

const SecondProposalData = (issueId, createdAt) => ({
    createdAt,
    githubLogin: "user-test2",
    id: 2,
    issueId,
    pullRequestId: 50,
    scMergeId: "0",
    updatedAt: "2022-03-31T16:07:41.687Z",
  });

export {
  Forksdata,
  BranchsData,
  UserBranchsData,
  ReposNetworkData,
  ReposUserData,
  FirstPrData,
  StatusPrGithubData,
  PrCommitsGithubData,
  FirstProposalData,
  SecondProposalData
};
