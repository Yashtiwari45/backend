import fs from "fs";
import path from "path";
import csv from "csv-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { connectDB } from "../utils/db.js";
import { Sale } from "../models/Sale.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 CHANGE this file name if your CSV is named differently
// e.g. "truestate_assignment_dataset.csv"
const csvPath = path.join(__dirname, "../../truestate_assignment_dataset.csv");

const BATCH_SIZE = 1000; // insert 1000 docs at a time to keep memory low

const mapRow = (row) => ({
  customerId: row["Customer ID"],
  customerName: row["Customer Name"],
  phoneNumber: row["Phone Number"],
  gender: row["Gender"],
  age: Number(row["Age"]),
  customerRegion: row["Customer Region"],
  customerType: row["Customer Type"],

  productId: row["Product ID"],
  productName: row["Product Name"],
  brand: row["Brand"],
  productCategory: row["Product Category"],
  tags: row["Tags"] ? row["Tags"].split("|").map((x) => x.trim()) : [],

  quantity: Number(row["Quantity"]),
  pricePerUnit: Number(row["Price per Unit"]),
  discountPercentage: Number(row["Discount Percentage"]),
  totalAmount: Number(row["Total Amount"]),
  finalAmount: Number(row["Final Amount"]),

  date: new Date(row["Date"]),
  paymentMethod: row["Payment Method"],
  orderStatus: row["Order Status"],
  deliveryType: row["Delivery Type"],
  storeId: row["Store ID"],
  storeLocation: row["Store Location"],
  salespersonId: row["Salesperson ID"],
  employeeName: row["Employee Name"],
});

const run = async () => {
  await connectDB();
  console.log("✅ MongoDB connected");
  console.log("🗑️ Clearing old data…");
  await Sale.deleteMany({});

  console.log("📄 Reading CSV from:", csvPath);

  let batch = [];
  let totalInserted = 0;

  const stream = fs.createReadStream(csvPath).pipe(csv());

  stream.on("data", (row) => {
    batch.push(mapRow(row));

    if (batch.length >= BATCH_SIZE) {
      // Pause the stream while we insert this batch
      stream.pause();
      Sale.insertMany(batch)
        .then(() => {
          totalInserted += batch.length;
          console.log(`✔ Inserted ${totalInserted} rows so far…`);
          batch = [];
          stream.resume();
        })
        .catch((err) => {
          console.error("Error inserting batch:", err);
          process.exit(1);
        });
    }
  });

  stream.on("end", async () => {
    try {
      if (batch.length > 0) {
        await Sale.insertMany(batch);
        totalInserted += batch.length;
      }
      console.log(`✅ Seeding complete. Total rows inserted: ${totalInserted}`);
      process.exit(0);
    } catch (err) {
      console.error("Error inserting final batch:", err);
      process.exit(1);
    }
  });

  stream.on("error", (err) => {
    console.error("Error reading CSV:", err);
    process.exit(1);
  });
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
