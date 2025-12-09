import { Router } from "express";
import { getSalesHandler } from "../controllers/salesController.js";

const router = Router();

router.get("/", getSalesHandler);

export default router;
