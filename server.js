const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// PostgreSQL Connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Post",
  password: "V@lidation@uj2025",
  port: 5432,
});

// Fetch student data based on email (PostgreSQL)
app.get("/students/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pgPool.query("SELECT * FROM public.ssdd_complete_student_decision_outcome WHERE email = $1", [email]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

// Fetch student status based on email (PostgreSQL)
app.get("/student-status/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pgPool.query("SELECT * FROM public.ssdd_complete_company_decision_outcome WHERE email = $1", [email]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching student status:", error);
    res.status(500).json({ error: "Failed to fetch student status" });
  }
});

// Fetch documents based on email (PostgreSQL)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/documents/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pgPool.query("SELECT * FROM public.ssdd_complete_uploaded_documents WHERE email = $1", [email]);
    
    const documentsWithUrls = result.rows.map((doc) => {
      const filePath = path.join(__dirname, "uploads", doc.file_name);
      const fileExists = fs.existsSync(filePath);
      return {
        ...doc,
        file_url: fileExists ? `http://10.114.0.15:5000/uploads/${doc.file_name}` : null,
      };
    });

    res.json(documentsWithUrls);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// API Route to Fetch User Details by Email (PostgreSQL)
app.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const query = `
      SELECT email, accounttype, is_active, is_placed 
      FROM public.ssdd_complete_login 
      WHERE email = $1 
      LIMIT 1
    `;
    const { rows } = await pgPool.query(query, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// API Route for Login (PostgreSQL)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const query = `
      SELECT * FROM public.ssdd_complete_login
      WHERE email = $1 AND password = $2
      AND accounttype = 'Learner'
      AND accountstatus = TRUE
      LIMIT 1
    `;
    const { rows } = await pgPool.query(query, [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials or unauthorized access" });
    }
    const user = rows[0];
    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        accounttype: user.accounttype,
        is_active: user.is_active,
        is_placed: user.is_placed,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Converted GM's Login (PostgreSQL)
app.post("/GMsLogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const query = `
      SELECT 
        email, 
        accounttype, 
        is_active, 
        is_placed 
      FROM public.ssdd_complete_login
      WHERE email = $1 AND password = $2
        AND accounttype = 'Company'
        AND accountstatus = TRUE
      LIMIT 1
    `;
    
    const result = await pgPool.query(query, [email, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials or unauthorized access" });
    }
    
    const user = result.rows[0];
    res.json({
      message: "GMsLogin successful",
      user: {
        email: user.email,
        accounttype: user.accounttype,
        is_active: user.is_active,
        is_placed: user.is_placed,
      },
    });
  } catch (err) {
    console.error("GMsLogin error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});
// Add this to your server.js
app.get("/organisations", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM mgmaster");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching organisations:", error);
    res.status(500).json({ error: "Failed to fetch organisations" });
  }
});
// Converted Organization Contracts (PostgreSQL)
app.get("/organisation-contracts", async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // Get organization name
    const orgQuery = `
      SELECT organisationname 
      FROM mgmaster 
      WHERE organisationemailaddress = $1 
         OR sdfemail = $1 
      LIMIT 1
    `;
    
    const orgResult = await pgPool.query(orgQuery, [email]);
    
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    const orgName = orgResult.rows[0].organisationname;
    
    // Get contracts
    const contractQuery = `
      SELECT 
        d.organisation_name,
        d.contract_number,
        d.amount_per_moa_gb_approvals,
        d.number_of_learners_funded_per_moa,
        d.amount_per_each_learner,
        d.programmes_afs,
        d.region,
        d.contract_start_date,
        d.contract_end_date,
        m.organisationemailaddress,
        m.ceoemail,
        m.sdfemail,
        l.email AS login_email,
        l.accounttype
      FROM dgmaster d
      LEFT JOIN mgmaster m
        ON LOWER(TRIM(d.organisation_name)) = LOWER(TRIM(m.organisationname))
      LEFT JOIN public.ssdd_complete_login l
        ON LOWER(TRIM(m.organisationemailaddress)) = LOWER(TRIM(l.email))
        OR LOWER(TRIM(m.sdfemail)) = LOWER(TRIM(l.email))
    `;
    
    const contractResult = await pgPool.query(contractQuery, [orgName]);
    
    res.json(contractResult.rows);
  } catch (err) {
    console.error("Error fetching organization contracts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Converted Organization Stats (PostgreSQL)
app.get("/organisation-stats", async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // Get organization name
    const orgQuery = `
      SELECT organisationname 
      FROM mgmaster 
      WHERE organisationemailaddress = $1 
         OR sdfemail = $1 
      LIMIT 1
    `;
    
    const orgResult = await pgPool.query(orgQuery, [email]);
    
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    const orgName = orgResult.rows[0].organisationname;
    
    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) AS total_contracts,
        SUM(amount_per_moa_gb_approvals) AS total_funding,
        SUM(number_of_learners_funded_per_moa) AS total_learners,
        CASE 
          WHEN SUM(number_of_learners_funded_per_moa) > 0 
          THEN SUM(amount_per_moa_gb_approvals) / SUM(number_of_learners_funded_per_moa)
          ELSE 0
        END AS avg_per_learner
      FROM dgmaster
    `;
    
    const statsResult = await pgPool.query(statsQuery, [orgName]);
    
    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error("Error fetching organization stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});