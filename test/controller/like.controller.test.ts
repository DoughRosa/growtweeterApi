import app from "../../src";
import request from "supertest";
import db from "../../src/database/prisma.connection";

describe("Test do likeController", () => {
  const dataUser = {
    name: "Teste 231",
    email: "teste14342@teste14343.com",
    password: "1234567",
    username: "arerasfsdf",
  };
  const dataTweet = {
    id: "1235",
    content: "conteudooo >:D",
  };
  let tweet = "";
  beforeAll(async () => {
    const user = await db.users.create({
      data: {
        name: dataUser.name,
        email: dataUser.email,
        password: dataUser.password,
        username: dataUser.username,
      },
    });
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", user);

    const tweetResponse = await db.tweets.create({
      data: { content: dataTweet.content, userId: user.data.id },
    });
    tweet = tweetResponse.data.id;
  });

  afterEach(async () => {
    try {
      const deletedUser = await db.users.delete({
        where: { email: dataUser.email },
      });
    } catch (error) {}
  });

  test("Deveria retornar 200 ao conseguir curtir um tweet", async () => {
    const response = await request(app)
      .post("/likes")
      .send({ tweetId: tweet })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Tweet Liked!");
  });

  test("Deveria retornar um 400 caso tente curtir o mesmo tweet", async () => {
    const response = await request(app)
      .post("/likes")
      .send({ tweetId: tweet })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("You Already Liked This Tweet.");
  });

  test("Deveria listar todos os tweets", async () => {
    const response = await request(app)
      .get("/likes")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe(true);
  });

  test("Deve mostrar a curtida pelo id", async () => {
    const response = await request(app)
      .get(`/likes/${dataTweet.id}}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Like Showed");
  });

  test("Deveria retornar um 404 se não poder achar o id do tweet", async () => {
    const response = await request(app)
      .get(`/likes/sdawdasd`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("Like Not Found");
  });

  test("Deveria deletar uma curtida pelo id", async () => {
    const response = await request(app)
      .delete(`/likes/${dataTweet.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Like Deleted");
  });

  test("Deveria retornar um 404 se não achar uma curtida", async () => {
    const response = await request(app)
      .delete(`/likes/${dataTweet.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe("Like Not Found");
  });
});
