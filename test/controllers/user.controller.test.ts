import app from "../../src/app";
import request from "supertest";
import db from "../../src/database/prisma.connection";
import generateHash from "../../src/utils/generateHash";

describe("Testes do user controller", () => {
  const dataUser = {
    email: "testeuser@email.com",
    name: "User Teste",
    password: "123456",
    username: "UT",
  };

  let userId: string;

  const hash = generateHash(dataUser.password);

  beforeAll(async () => {
    const user = await request(app)
      .post("/users")
      .send({email: dataUser.email, password: hash, name: dataUser.name, username: dataUser.username})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    userId = user.body.data.id;
  });

  afterAll(async () => {
    await db.users.delete({
      where: {email: dataUser.email},
    });
  });

  test("Deveria retornar 400 caso a pessoa não digite os todos os campos", async () => {
    const response = await request(app)
      .post("/users")
      .send({name: dataUser.name, email: dataUser.email, password: "", username: dataUser.username})
      .set("Accept", "application/json");

    expect(response.status).toEqual(400);
  });

  test("Deveria retornar um 400 ao tentar criar um usuário com dados já existentes", async () => {
    const response = await request(app).post("/users").send(dataUser).set("Accept", "application/json");

    const response2 = await request(app).post("/users").send(dataUser).set("Accept", "application/json");

    expect(response.status).toEqual(400);
  });

  test("Deveria retornar um 500 ao tentar criar um usuário com dados inválidos", async () => {
    const response = await request(app)
      .post("/users")
      .send({email: 4561987, password: dataUser.password, name: dataUser.name, username: dataUser.username})
      .set("Accept", "application/json");

    expect(response.status).toEqual(500);
  });

  test("Deveria listar todos os usuários no método get do /users", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .get("/users")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.body).toHaveProperty("data");
  });

  test("Deveria retornar um 500 ao buscar um usuário inválido", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .get(`/users/0fa82d40-bab7-4000-8f27-abd706cb24`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(500);
  });

  test("Deveria listar um usuário buscado pelo seu id único", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .get(`/users/${userId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.body).toHaveProperty("data");
  });

  test("Deveria retornar um 404 ao tentar atualizar um usuário que não existe", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .post(`/users/${userId}`)
      .send({name: "aijdiosja", password: "aodjoisjd", username: "diaojsdiosj"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(404);
  });

  test("Deveria retornar um 200 ao tentar atualizar um usuário existente", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .put(`/users/${userId}`)
      .send({name: "aijdiosja", password: "aodjoisjd", username: "diaojsdiosj"})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toEqual(200);
  });

  test("Deveria apagar um usuário ao passar o id de um usuário existente no metodo delete do /users", async () => {
    const requestLogin = await request(app)
      .post("/auth")
      .send({email: dataUser.email, password: hash})
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const token = requestLogin.body.data.token;

    const response = await request(app)
      .get(`/users/${userId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    const deleteUser = await request(app)
      .delete(`/users/${userId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(deleteUser).toHaveProperty("id");
  });
});
