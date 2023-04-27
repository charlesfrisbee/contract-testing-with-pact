import { it, describe, expect } from "vitest";
import nock from "nock";
import fetch from "node-fetch";
import {
  PactV3,
  MatchersV3,
  SpecificationVersion,
  Verifier,
} from "@pact-foundation/pact";
import path from "path";
import app from "../src/api";
const { like } = MatchersV3;

// describe("API", () => {
//   it("get all products", async () => {
//     const user = { id: "1", name: "Jackkckck", age: 21 };

//     nock("http://localhost:3000")
//       .get("/users/1")
//       .reply(200, user, { "Access-Control-Allow-Origin": "*" });
//     const respUser = await fetch("http://localhost:3000/users/1");
//     const userParsed = await respUser.json();
//     expect(userParsed).toEqual(user);
//   });
// });

const provider = new PactV3({
  consumer: "FrontendWebsite",
  provider: "UserService",
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2,
});

describe("GET /user/1", () => {
  it("returns an HTTP 200 and a single user", () => {
    // Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    provider
      .given("A user with id 1 exists")
      .uponReceiving("A request for a single user with id 1")
      .withRequest({
        method: "GET",
        path: "/users/1",
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: like({ id: "1", name: "James", age: 21 }),
      });
    return provider.executeTest(async (mockserver) => {
      // Act: test our API client behaves correctly
      //
      // We point out API to the mock service Pact created for us, instead of
      // the real one

      const res = await fetch(`${mockserver.url}/users/1`);
      const json = await res.json();

      // Assert: check the result
      expect(json).to.deep.eq({
        id: "1",
        name: "James",
        age: 21,
      });
    });
  });
});

app.listen(8081, async () => {
  console.log("User Service listening on http://localhost:8081");
});

// (2) Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  it("validates the expectations of Matching Service", () => {
    return new Verifier({
      providerBaseUrl: "http://localhost:8081", // <- location of your running provider
      pactUrls: [
        path.resolve(process.cwd(), "./pacts/FrontendWebsite-UserService.json"),
      ],
    })
      .verifyProvider()
      .then(() => {
        console.log("Pact Verification Complete!");
      });
  });
});
