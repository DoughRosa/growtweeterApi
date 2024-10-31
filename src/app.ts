import express from "express";
import * as dotenv from "dotenv";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import tweetRoutes from "./routes/tweets.routes";
import likeRoutes from "./routes/likes.routes";
import repliesRoutes from "./routes/replies.routes";
import followerRoutes from "./routes/follower.routes";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use("/users", userRoutes());
app.use("/auth", authRoutes());
app.use("/tweet", tweetRoutes());
app.use("/like", likeRoutes());
app.use("/replies", repliesRoutes());
app.use("/follower", followerRoutes());

export default app;
