const { httpServer } = require("./src/app");

const PORT = process.env.SERVER_PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});