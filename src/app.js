const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 4000;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
import { userAuthRouter } from "./routers/userRouter";
import { errorMiddleware } from "./middlewares/errorMiddleware";

const app = express();

app.use(userAuthRouter);
app.use(errorMiddleware);

export { app };
