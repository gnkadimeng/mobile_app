const sql = require("mssql");
const sqlConfig = require("./config");

async function connectToDatabase() {
  try {
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL Server successfully!");
    return pool;
  } catch (error) {
    console.error("Database connection failed: ", error);
  }
}

module.exports = connectToDatabase;
