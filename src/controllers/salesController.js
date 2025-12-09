import { getSales } from "../services/salesService.js";

export const getSalesHandler = async (req, res) => {
  try {
    const result = await getSales(req.query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
