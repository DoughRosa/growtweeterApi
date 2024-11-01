import request from "supertest";
import app from "../../src/app";

describe("este teste do middleware auth", () => {
  test("deveria retornar 401 caso seja enviado um token incorreto", async () => {
    const response = await request(app)
      .post("/replies")
      .set("Accept", "application/json")
      .set("Authorization", `bearer TOKEN`);

    expect(response.status).toEqual(401);
  });
});
