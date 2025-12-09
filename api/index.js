import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../src/utils/db.js";
import salesRoutes from "../src/routes/salesRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("TruEstate Sales API");
});

app.use("/api/sales", salesRoutes);

export default app;