const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const error = require("./utils/error");

const authRoute = require("./routes/auth");
const ageVerifyRoute = require("./routes/ageVerify");
const genderVerifyRoute = require("./routes/genderVerify");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(error);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

app.use("/age-verification", ageVerifyRoute(wss));
app.use("/gender-verification", genderVerifyRoute(wss));

// #swagger.tags = ['auth']
app.use("/auth", authRoute(wss));
