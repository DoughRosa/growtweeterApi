import app from "../../src/app";
import request from "supertest";
import db from "../../src/database/prisma.connection";

describe("Test do likeController", () => {
  let token: string | null = null;
  let tweetId: string | null = null;
  let userId: string | null = null;
  const dataUser = {
    name: "TesteLIKE",
    email: "testeLIKE@LIKE.com",
    password: "1234567",
    username: "TesteLIKE",
  };

  beforeAll(async () => {
    const createUser = await request(app)
      .post("/users")
      .send({
        name: dataUser.name,
        email: dataUser.email,
        password: dataUser.password,
        username: dataUser.username,
      })
      .set("Accept", "application/json");

    const login = await request(app)
      .post("/auth")
      .send({
        email: dataUser.email,
        password: dataUser.password,
      })
      .set("Accept", "application/json");

    const tweet = await request(app)
      .post("/tweet")
      .send({ content: "teste LIKETEST" })
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${login.body.data.token}`);

    token = login.body.data.token;
    tweetId = tweet.body.data.id;
    userId = createUser.body.data.id;
  });

  afterAll(async () => {
    const deleteTweet = await db.tweets.delete({
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

  test("Deveria retornar 400 ao não passar id do tweet", async () => {
    const response = await request(app)
      .post("/like")
      .send({ tweetId: null })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("Deveria retornar um 400 caso tente curtir o mesmo tweet", async () => {
    const responseLike = await request(app)
      .post(`/like`)
      .send({ tweetId })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    const likeTweet = await request(app)
      .post(`/like`)
      .send({ tweetId })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    const response = await request(app)
      .delete(`/like/${responseLike.body.data.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    expect(likeTweet.status).toBe(400);
  });

  test("Deveria listar todos os likes", async () => {
    const response = await request(app)
      .get("/like")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test("Deve mostrar a curtida pelo id", async () => {
    const responseLike = await request(app)
      .post(`/like`)
      .send({ tweetId })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    const response = await request(app)
      .delete(`/like/${responseLike.body.data.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test("Deveria deletar uma curtida pelo id", async () => {
    const responseLike = await request(app)
      .post(`/like`)
      .send({ tweetId })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);

    const response = await request(app)
      .delete(`/like/${responseLike.body.data.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test("Deveria retornar um 404 se não achar a curtida", async () => {
    const response = await request(app)
      .delete(`/like/f4adac70-d4a4-421d-979a-af7703d702b1`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(404);
  });
  test("Deveria retornar 500 se mandar um id do tweet errado", async () => {
    const response = await request(app)
      .post(`/like`)
      .send({ tweetId: 1234 })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(500);
  });
  test("Deve listar os likes", async () => {
    const response = await request(app)
      .get(`/like/${tweetId}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(200);
  });
  test("Deve retornar 500 mandar um id de like incorreto ", async () => {
    const response = await request(app)
      .get(`/like/213123`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(500);
  });
  test("Deve retornar 404 não achar um id de like  ", async () => {
    const response = await request(app)
      .get(`/like/f4adac70-d4a4-421d-979a-af7703d702b1`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(404);
  });
  test("Deveria retornar 500 ao tentar deletar um like com payload incorreto", async () => {
    const response = await request(app)
      .delete(`/like/${123}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `bearer ${token}`);
    expect(response.status).toBe(500);
  });
});
