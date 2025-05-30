const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const sql = require("msnodesqlv8");


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

//SQL Connection

const server = "APB-JBSG-131L\\SQLEXPRESS";
const database = "CHIETA_INTEGRATED";
const userName = "chris";
const password = "V@lidation@uj2024";

const connectionString = `Server=${server};Database=${database};UID=${userName};PWD=${password};Driver={ODBC Driver 17 for SQL Server}`;


const dgApplications = `
SELECT Top 3
    dg.short_contract_number,
    dg.contract_number,
    dg.region,
    dg.rsa,
    dg.cost_code,
    dg.contract_start_date,
    dg.contract_end_date,
    dg.dg_year,
    dg.cycle,
    dg.organisation_name,
    dg.funding_window_name,
    dg.programmes_afs,
    dg.cycle_1_board_approved,
    dg.cycle_2_board_approved,
    dg.cycle_3_board_approved,
    dg.amount_per_moa_gb_approvals,
    dg.number_of_learners_funded_per_moa,
    dg.amount_per_each_learner,
    dg.dgMaster_id,
    mg.tradingName,
    mg.chietaReportingRegion,
    mg.province,
    mg.companySize,
    mg.numberOfEmployees,
	mg.sdfEmail
FROM 
    [grantManagementDB].[dbo].[dgMaster] dg
INNER JOIN 
    [grantManagementDB].[dbo].[mgMaster] mg
    ON dg.organisation_name = mg.organisationName
`;

// Discretionary Grant Dashboard (GMS)
app.get("/dg-dashboard", (req, res, next) => {
    sql.query(connectionString, dgApplications, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Database error" });
        } else if (rows && rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send("No records found");
        }
    });
});



const documentsQuery = `
SELECT 
  d.[Id] AS document_id,
  d.[entityid] AS entity_id,
  o.[Id] AS organisation_id,
  o.[SDL_No] AS sdl_no,
  d.[userid] AS user_id,
  d.[filename] AS file_name,
  d.[documenttype] AS document_type,
  d.[module],
  o.[Organisation_Name] AS organisation_name,
  o.[Organisation_Contact_Name] AS organisation_contact_name
FROM [tbl_Documents] d
INNER JOIN [tbl_Organisation] o
  ON d.[entityid] = o.[Id]
WHERE (
  d.[filename] LIKE '%award%'
  OR d.[filename] LIKE '%moa%'
  OR d.[filename] LIKE '%wsp%'
)`;

app.get("/documents", async (req, res) => {
  try {
    await sqlConnectPromise; 
    
    const result = await sqlPool.request().query(documentsQuery);
    
    const documentsWithUrls = await Promise.all(
      result.recordset.map(async (doc) => {
        try {
          const filePath = path.join(__dirname, "uploads", doc.file_name);
          const fileExists = fs.existsSync(filePath);
          
          return {
            ...doc,
            file_url: fileExists ? 
              `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(doc.file_name)}` : 
              null,
            file_exists: fileExists
          };
        } catch (fileError) {
          console.error(`Error processing file ${doc.file_name}:`, fileError);
          return {
            ...doc,
            file_url: null,
            file_exists: false,
            file_error: "Error checking file"
          };
        }
      })
    );

    res.json(documentsWithUrls);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ 
      error: "Failed to fetch documents",
      details: error.message 
    });
  }
});

// SQL query status Application of DG details
const DgFeedback = `
SELECT  [Id]
      ,[ProjectId]
      ,[ApprovalTypeId]
      ,[ApprovalStatusId]
      ,[BankLetter]
      ,[Comments]
      ,[Outcome]
      ,[DateCreated]
      ,[UserId]
  FROM [CHIETA_INTEGRATED].[dbo].[tbl_Discretionary_Grant_Approvals]
`;

// GET status Application of DgFeedback
app.get("/dg-status", (req, res, next) => {
    sql.query(connectionString, DgFeedback, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Database error" });
        } else if (rows && rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send("No active DG Status found");
        }
    });
});


// SQL query status Application of Lesedi details
const activeDgWindow = `
SELECT 
  [Id],
  [ApplicationId],
  [ApprovalTypeId],
  [ApprovalStatusId],
  [Results],
  [Comments],
  [Outcome],
  [OutcomeDate],
  [UserId]
FROM 
  [CHIETA_INTEGRATED].[dbo].[tbl_Discretionary_Bursary_Approvals]
`;

// GET status Application of Lesedi details
app.get("/bursary-status", async (req, res, next) => {
  try {
    const result = await sql.query(connectionString, activeDgWindow);
    if (result && result.length > 0) {
      res.json(result);
    } else {
      res.status(404).send("No active Lesedi Status found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
// // Submit DG Application
// app.post('/dg-applications', async (req, res) => {
//   try {
//     await poolConnect;
    
//     // Extract data from request body
//     const {
//       ProjectNam,
//       ProjShortNam,
//       ProjectStartDate,
//       SubmissionDte,
//       WindowParamId,
//       OrganisationId,
//       UserId
//     } = req.body;

//     // Basic validation
//     if (!ProjectNam || !ProjShortNam || !WindowParamId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     // Insert new DG application
//     const result = await pool.request()
//       .input('ProjectNam', sql.NVarChar, ProjectNam)
//       .input('ProjShortNam', sql.NVarChar, ProjShortNam)
//       .input('ProjectStartDate', sql.Date, ProjectStartDate || new Date())
//       .input('SubmissionDte', sql.Date, SubmissionDte || new Date())
//       .input('WindowParamId', sql.Int, WindowParamId)
//       .input('OrganisationId', sql.Int, OrganisationId || 1) // Default if not provided
//       .input('UserId', sql.Int, UserId || 1) // Default if not provided
//       .input('ProjectStatusID', sql.Int, 1) // Default status: Submitted
//       .query(`
//         INSERT INTO tbl_Discretionary_Project (
//           ProjectNam, 
//           ProjShortNam, 
//           ProjectStartDate,
//           SubmissionDte,
//           WindowParamId,
//           OrganisationId,
//           UserId,
//           ProjectStatusID
//         )
//         OUTPUT INSERTED.Id
//         VALUES (
//           @ProjectNam, 
//           @ProjShortNam, 
//           @ProjectStartDate,
//           @SubmissionDte,
//           @WindowParamId,
//           @OrganisationId,
//           @UserId,
//           @ProjectStatusID
//         )
//       `);

//     const projectId = result.recordset[0].Id;

//     res.status(201).json({
//       success: true,
//       message: 'DG Application submitted successfully',
//       applicationId: `APP-${new Date().getFullYear()}-${projectId}`
//     });

//   } catch (err) {
//     console.error('Error submitting DG application:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to submit DG application',
//       error: err.message
//     });
//   }
// });


// Login endpoint
app.post('/IMsLogin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const query = `
    SELECT 
      EmailAddress AS email,
      Role AS role
    FROM [CHIETA_INTEGRATED].[dbo].[AbpUsers] 
    WHERE EmailAddress = '${email}' 
      AND Password = '${password}'
  `;

  sql.query(connectionString, query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (rows && rows.length > 0) {
      res.json({ 
        success: true,
        role: rows[0].role || 'IM' // Default to IM if role not specified
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password!' 
      });
    }
  });
});



// Fetch student data based on email (PostgreSQL SSDD)
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

// Fetch student status based on email (PostgreSQL SSDD)
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

// Fetch documents based on email (PostgreSQL SSDD)
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

// API Route to Fetch User Details by Email (PostgreSQL SSDD)
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


// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});