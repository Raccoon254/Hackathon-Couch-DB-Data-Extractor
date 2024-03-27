const axios = require("axios");

const url = "localhost:3000";

describe("authRoute", () => {
  it("should return a 200 status code", async () => {
    const response = await axios.post(`${url}/auth`, {
      username: "test",
      password: "test",
    });
    expect(response.status).toBe(200);
  });
});

describe("Page not found", async () => {
  const response = await axios.get(`${url}/notfound`);
  expect(response.status).toBe(404);
});
