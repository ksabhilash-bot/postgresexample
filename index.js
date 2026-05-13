import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";
import cors from "cors";
import Adminrouter from "./router/admin.js";
import { creationOfTable } from "./initDb.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "Hello, World!" });
});

app.use("/api/admin", Adminrouter);

app.listen(process.env.PORT, async () => {
  try {
    await pool.query("SELECT 1");
    await creationOfTable();
    console.log(
      `Db is connected and server is running http://localhost:${process.env.PORT}`,
    );
  } catch (error) {
    console.log("error occured:", error);
    process.exit(1);
  }
});
