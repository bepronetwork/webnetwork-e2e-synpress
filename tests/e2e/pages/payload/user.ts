import { faker } from "@faker-js/faker";

const githubLogin = "user-test";
const accessToken = "test";
const githubHandle = "User Test";

function userData(
  address: string,
  login = githubLogin,
  NameHandle = githubHandle
) {
  return {
    id: 5,
    githubHandle: NameHandle,
    githubLogin: login,
    address,
    accessToken,
    createdAt: "2022-03-03T21:12:55.075Z",
    updatedAt: "2022-03-03T21:13:10.062Z",
  };
}

const userSessionData = (accessToken) => {
  return {
    expires: faker.date.future(1),
    user: {
      name: githubHandle,
      email: faker.internet.email(),
      image: "https://avatars.githubusercontent.com/u/34746557?v=4",
      login: githubLogin,
      accessToken: accessToken,
    },
  };
};

export { userData, userSessionData };
