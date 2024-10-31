import request from "supertest";
import app from "../../src/app";
import generateHash from "../../src/utils/generateHash";
import db from "../../src/database/prisma.connection";

describe("este teste do utils authController", () => {
  test("deveria retornar 400 caso seja enviado o payload incorreto", async () => {
    const response = await request(app).post("/auth").send({ palavra: "" });

    expect(response.status).toEqual(400);
  });

  test("deveria retornar 401 caso email ou password enviados sejam incorretos", async () => {
    const response = await request(app).post("/auth").send({ email: "neymar@neymar.com", password: "12345" });

    expect(response.status).toEqual(401);
  });

  test("deveria retornar 200 caso email e password enviados sejam corretos", async () => {
    const hash = generateHash("1234");

    const newUser = await db.users.create({
      data: {
        email: "douglas@douglas.com",
        password: hash,
        name: "Douglas",
        username: "Rosa1993",
      },
    });

    const id = newUser.id;

    const response = await request(app).post("/auth").send({ email: "douglas@douglas.com", password: "1234" });

    await db.users.delete({
      where: { id },
    });

    expect(response.status).toEqual(200);
  });

  test("deveria retornar 500 caso ocorra erro no Banco de Dados", async () => {
    const response = await request(app).post("/auth").send({ email: 5, password: 5 });

    expect(response.status).toEqual(500);
  });
});
