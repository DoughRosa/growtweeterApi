import app from "../../src/app";
import request from "supertest";
import db from "../../src/database/prisma.connection";

describe("este teste do follower controller", () => {
  let token: string | null = null;
  let userId: string | null = null;
  let followId: string | null = null;
  const userData = {
    name: "teste Follower",
    email: "testeFollower@teste.com",
    password: "123456",
    username: "testeFollower",
  };
  const followData = {
    name: "follow",
    email: "follow@teste.com",
    password: "123456",
    username: "follower",
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

    const createFollow = await request(app)
      .post("/users")
      .send({
        name: followData.name,
        email: followData.email,
        password: followData.password,
        username: followData.username,
      })
      .set("Accept", "application/json");

    followId = createFollow.body.data.id;
    token = login.body.data.token;
    userId = createUser.body.data.id;
  });

  afterAll(async () => {
    const deleteUser = await db.users.delete({
      where: {
        id: userId ?? "",
      },
    });

    const deleteFollow = await db.users.delete({
      where: {
        id: followId ?? "",
      },
    });
  });

  //////////////////////////CREATE FOLLOWERS//////////////////////////

  test("deveria retornar 500 ao enviar o payload de follower incorreto", async () => {
    const response = await request(app)
      .post("/follower")
      .send({ id: 1 })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });

  test("deveria retornar 400 ao enviar um usuario incorreto para follower incorreto", async () => {
    const response = await request(app)
      .post("/follower")
      .send({ id: "a4a9f985-6a30-486a-9608-b3e7a24a4813" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(400);
  });

  test("deveria retornar 400 ao tentar seguir a si mesmo", async () => {
    const response = await request(app)
      .post("/follower")
      .send({ id: userId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(400);
  });

  test("deveria retornar 400 ao tentar seguir uma pessoa que ja segue", async () => {
    expect.assertions(3);

    const response = await request(app)
      .post("/follower")
      .send({ id: followId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);

    const responseRepeat = await request(app)
      .post("/follower")
      .send({ id: followId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseRepeat.status).toEqual(400);

    const deleteFollow = await request(app)
      .delete(`/follower/${response.body.data.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(deleteFollow.status).toEqual(200);
  });

  //////////////////////////LIST FOLLOWERS//////////////////////////

  test("deveria retornar 200 listar todos os followers", async () => {
    const response = await request(app)
      .get("/follower")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);
  });

  //////////////////////////SHOW FOLLOWERS//////////////////////////

  test("deveria retornar 200 ao listar um follower especifico", async () => {
    expect.assertions(3);

    const response = await request(app)
      .post("/follower")
      .send({ id: followId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);

    const responseShow = await request(app)
      .get(`/follower/${response.body.data.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseShow.status).toEqual(200);

    const deleteFollow = await request(app)
      .delete(`/follower/${response.body.data.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(deleteFollow.status).toEqual(200);
  });

  test("deveria retornar 404 ao tentar listar um follower inexistente", async () => {
    const responseShow = await request(app)
      .get("/follower/65d58f07-feb0-41a7-aa41-327f08723717")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseShow.status).toEqual(404);
  });

  test("deveria retornar 500 ao tentar passar um payload invalido", async () => {
    const responseShow = await request(app)
      .get(`/follower/${500}`)
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(responseShow.status).toEqual(500);
  });

  //////////////////////////DELETE FOLLOWERS//////////////////////////
  test("deveria retornar 404 ao tentar fazer deletar em um follower inexistente", async () => {
    const response = await request(app)
      .delete("/follower/65d58f07-feb0-41a7-aa41-327f08723717")
      .send({ id: followId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(404);
  });

  test("deveria retornar 500 ao mandar um payload invalido", async () => {
    const response = await request(app)
      .delete(`/follower/${500}`)
      .send({ id: followId })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });
});
