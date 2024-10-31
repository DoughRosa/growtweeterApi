import * as dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running... ${port}`);
});

app.use('/users', userRoutes());
app.use('/auth', authRoutes());
app.use('/tweet', tweetRoutes());
app.use('/like', likeRoutes());

export default app
