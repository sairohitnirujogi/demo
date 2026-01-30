// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "127.0.0.1", // Cloud SQL Proxy
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // Test DB connection once at startup
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ DB connection failed:", err.message);
//   } else {
//     console.log("✅ Connected to Cloud SQL");
//     connection.release();
//   }
// });

// module.exports = pool;

const mongoose = require("mongoose");
 
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    process.exit(1);
  }
};
 
module.exports = connectDB;