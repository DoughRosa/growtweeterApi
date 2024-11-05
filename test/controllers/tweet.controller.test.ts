import app from "../../src/app";
import request from "supertest";
import db from "../../src/database/prisma.connection";

describe("Testes do Tweet controller", () => {
  const dataUser = {
    email: "testeTweet@email.com",
    name: "Tweet Teste",
    password: "123456",
    username: "Tweet Teste",
  };

  let userId: string;
  let token: string;

  beforeAll(async () => {
    const user = await request(app)
      .post("/users")
      .send({
        email: dataUser.email,
        password: dataUser.password,
        name: dataUser.name,
        username: dataUser.username,
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    userId = user.body.data.id;

    const auth = await request(app).post("/auth").send({ email: dataUser.email, password: dataUser.password });

    token = auth.body.data.token;
  });

  afterAll(async () => {
    await db.users.delete({
      where: { email: dataUser.email },
    });
  });

  test("Deveria retornar 200 ao tentar criar um tweet", async () => {
    const response = await request(app)
      .post("/tweet")
      .send({ content: "Teste de tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    const deleteTweet = await db.tweets.delete({
      where: { id: response.body.data.id },
    });

    expect(userId).toBeDefined();
    expect(response.status).toBe(200);
    expect(deleteTweet).toHaveProperty("id");
  });

  test("Deveria retornar 400 ao enviar um tweet sem conteúdo", async () => {
    const response = await request(app)
      .post("/tweet")
      .send({ content: null })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(userId).toBeDefined();
    expect(response.status).toBe(400);
  });

  test("Deveria retornar 500 ao enviar um Payload inválido", async () => {
    const response = await request(app)
      .post("/tweet")
      .send({ content: 123 })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });

  test("Deveria listar todos os tweets no método get do /tweets", async () => {
    const response = await request(app)
      .get("/tweet")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveProperty("data");
  });

  test("Deveria retornar 200 ao buscar todos os tweets de um usuario", async () => {
    const response = await request(app)
      .get(`/tweet/${userId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveProperty("data");
    expect(response.status).toBe(200);
  });

  test("Deveria retornar 404 ao buscar todos os tweets de um usuario inexistente", async () => {
    let userId = "c9054e1e-1839-4eb3-9452-fea6d3b0cf22";
    const response = await request(app)
      .get(`/tweet/${userId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body.data).toEqual([]);
    expect(response.status).toBe(200);
  });

  test("Deveria retornar 200 quando o tweet é atualizado com sucesso", async () => {
    const tweetCreate = await request(app)
      .post("/tweet")
      .send({ content: "Teste de tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    const tweetId = tweetCreate.body.data.id;

    const response = await request(app)
      .put(`/tweet/${tweetId}`)
      .send({ content: "Conteúdo atualizado do tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    const deleteTweet = await db.tweets.delete({
      where: { id: tweetId },
    });

    expect(deleteTweet).toHaveProperty("id");
    expect(response.status).toBe(200);
  });

  test("Deveria retornar 404 quando o tweet não é encontrado", async () => {
    const tweetId = "1b0c619f-6a5d-4fb1-bfe6-e7e6c5c25498";

    const response = await request(app)
      .put(`/tweet/${tweetId}`)
      .send({ content: "Conteúdo atualizado do tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test("Deveria retornar 500 quando o tweet não atualizado", async () => {
    const tweetId = 123;

    const response = await request(app)
      .put(`/tweet/${tweetId}`)
      .send({ content: "Conteúdo atualizado do tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });

  test("Deveria retornar 200 quando o tweet é deletado com sucesso", async () => {
    const tweetCreate = await request(app)
      .post("/tweet")
      .send({ content: "Teste de tweet" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    const tweetId = tweetCreate.body.data.id;

    const response = await request(app)
      .delete(`/tweet/${tweetId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("Deveria retornar 404 quando o tweet não é encontrado para deletar", async () => {
    const tweetId = "c9054b1e-1132-4eb3-9a32-a21623b0cf13";

    const response = await request(app)
      .delete(`/tweet/${tweetId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test("Deveria retornar 500 quando passado um payload invalido", async () => {
    const tweetId = 123;

    const response = await request(app)
      .delete(`/tweet/${tweetId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
});
