const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes");

const port = process.env.SERVER_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(router);

app.listen(port, () => console.log(`Server is running on port ${port}`));
