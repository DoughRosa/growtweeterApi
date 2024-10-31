import app from "../../src";
import request from "supertest";
import prismaConnection from "../../src/database/prisma.connection";
import generateHash from "../../src/utils/generateHash";

describe("Testes do Tweet controller", () => {
  test("Deveria retornar 200 ao tentar criar um tweet", async () => {
    const user = await prismaConnection.users.create({
      data: {
        email: "testeTweet@teste.com",
        name: "TestTweet",
        password: generateHash("TestTweet"),
        username: "TestTweet",
      },
    });

    const auth = await request(app)
      .post("/auth")
      .send({ email: 'testeTweet@teste.com', password: "TestTweet" });

    const token = auth.body.data.token;
    
    const response: any = await request(app)
      .post("/tweet")
      .send({ content: "Teste de tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    const deleteTweet = await prismaConnection.tweets.delete({
        where:  {id: response.body.data.id}
      });

    const deleteUser = await prismaConnection.users.delete({
        where: {id: user.id}
    })

    expect(user).toHaveProperty('id');
    expect(auth.status).toBe(200);
    expect(response.status).toBe(200);
    expect(deleteTweet).toHaveProperty('id');
    expect(deleteUser).toHaveProperty('id');
  });
});
