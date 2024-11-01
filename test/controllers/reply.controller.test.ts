import app from "../../src/app";
import request from "supertest";
import db from "../../src/database/prisma.connection";

describe("este teste do reply controller", () => {
  let token: string | null = null;
  let tweetId: string | null = null;
  let userId: string | null = null;
  const userData = {
    name: "teste Reply",
    email: "testeReply@teste.com",
    password: "123456",
    username: "testeReply",
  };

  beforeAll(async () => {
    const createUser = await request(app)
      .post("/users")
      .send({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        username: userData.username,
      })
      .set("Accept", "application/json");

    const login = await request(app)
      .post("/auth")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .set("Accept", "application/json");

    const tweet = await request(app)
      .post("/tweet")
      .send({ content: "teste REPLY TEST" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${login.body.data.token}`);

    token = login.body.data.token;
    tweetId = tweet.body.data.id;
    userId = createUser.body.data.id;
  });

  afterAll(async () => {
    const deleteTweet = await db.tweets.deleteMany({
      where: {
        id: tweetId ?? "",
      },
    });

    const deleteUser = await db.users.delete({
      where: {
        id: userId ?? "",
      },
    });
  });

  //////////////////////////CREATE REPLIES//////////////////////////

  test("deveria retornar 400 ao enviar o payload de tweet incorreto", async () => {
    const response = await request(app)
      .post("/replies")
      .send({ tweetId: null, content: "teste" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(400);
  });

  test("deveria retornar 400 ao enviar o payload de content incorreto", async () => {
    const response = await request(app)
      .post("/replies")
      .send({ tweetId, content: null })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(400);
  });

  test("deveria retornar 500 caso de algum erro de banco ao tentar criar um reply", async () => {
    const response = await request(app)
      .post("/replies")
      .send({ tweetId: 123, content: "teste" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });

  test("deveria retornar 200 ao criar um reply com sucesso", async () => {
    expect.assertions(2);

    const response = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);

    const responseTweet = await db.replies.delete({
      where: {
        id: response.body.data.id,
      },
    });

    expect(responseTweet).toHaveProperty("id");
  });

  //////////////////////////LIST REPLIES//////////////////////////

  test("deveria retornar 200 ao tentar listar todos os replies", async () => {
    const response = await request(app)
      .get("/replies")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);
  });

  //////////////////////////SHOW REPLIES//////////////////////////

  test("deveria retornar 200 ao tentar listar um unico reply", async () => {
    expect.assertions(3);

    const responseCreateReply = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseCreateReply.status).toEqual(200);

    const response = await request(app)
      .get(`/replies/${responseCreateReply.body.data.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);

    const responseTweet = await db.replies.delete({
      where: {
        id: responseCreateReply.body.data.id,
      },
    });

    expect(responseTweet).toHaveProperty("id");
  });

  test("deveria retornar 404 ao não encontrar o reply", async () => {
    const response = await request(app)
      .get(`/replies/3e962168-36cc-4acc-902c-a00db14f3f20`) //ID INEXISTENTE
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(404);
  });

  test("deveria retornar 500 ao passar um parametro invalido", async () => {
    const response = await request(app)
      .get(`/replies/invalidparameter`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });

  //////////////////////////UPDATE REPLIES//////////////////////////

  test("deveria retornar 404 ao não encontrar o reply para atualizalo", async () => {
    const response = await request(app)
      .put(`/replies/3e962168-36cc-4acc-902c-a00db14f3f20`) //ID INEXISTENTE
      .send({ content: "retweet atualizado com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(404);
  });

  test("deveria retornar 500 ao acontecer um erro de banco de dados", async () => {
    expect.assertions(3);

    const responseCreateReply = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseCreateReply.status).toEqual(200);

    const response = await request(app)
      .put(`/replies/${responseCreateReply.body.data.id}`)
      .send({ content: 123 })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);

    const responseTweet = await db.replies.delete({
      where: {
        id: responseCreateReply.body.data.id,
      },
    });

    expect(responseTweet).toHaveProperty("id");
  });

  test("deveria retornar 400 ao tentar atualizar um reply sem content", async () => {
    expect.assertions(3);

    const responseCreateReply = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseCreateReply.status).toEqual(200);

    const response = await request(app)
      .put(`/replies/${responseCreateReply.body.data.id}`)
      .send({ content: null })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(400);

    const responseTweet = await db.replies.delete({
      where: {
        id: responseCreateReply.body.data.id,
      },
    });

    expect(responseTweet).toHaveProperty("id");
  });

  test("deveria retornar 200 ao atualizar um reply", async () => {
    expect.assertions(3);

    const responseCreateReply = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseCreateReply.status).toEqual(200);

    const response = await request(app)
      .put(`/replies/${responseCreateReply.body.data.id}`)
      .send({ content: "retweet atualizado com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);

    const responseTweet = await db.replies.delete({
      where: {
        id: responseCreateReply.body.data.id,
      },
    });

    expect(responseTweet).toHaveProperty("id");
  });

  //////////////////////////DELETE REPLIES//////////////////////////

  test("deveria retornar 200 ao tentar deletar um unico reply", async () => {
    expect.assertions(2);

    const responseCreateReply = await request(app)
      .post("/replies")
      .send({ tweetId, content: "retweet com sucesso" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseCreateReply.status).toEqual(200);

    const response = await request(app)
      .delete(`/replies/${responseCreateReply.body.data.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);
  });

  test("deveria retornar 404 ao não encontrar o reply ao tentar deletar", async () => {
    const response = await request(app)
      .delete(`/replies/3e962168-36cc-4acc-902c-a00db14f3f20`) //ID INEXISTENTE
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(404);
  });

  test("deveria retornar 500 ao passar um parametro invalido ao tentar deletar um reply", async () => {
    const response = await request(app)
      .delete(`/replies/invalidparameter`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });
});
