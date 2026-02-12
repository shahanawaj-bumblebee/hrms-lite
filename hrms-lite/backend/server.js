const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "HRMS API Running" });
});

/*
=============================
   EMPLOYEE ROUTES
=============================
*/

// ➕ Create Employee
app.post("/api/employees", async (req, res) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    if (!employeeId || !fullName || !email || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        email,
        department,
      },
    });

    res.status(201).json(newEmployee);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Employee ID or Email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// 📄 Get All Employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ❌ Delete Employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.employee.delete({
      where: { id },
    });

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Employee not found" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/*
=============================
   ATTENDANCE ROUTES
=============================
*/

// ➕ Mark Attendance
app.post("/api/attendance", async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({ message: "Status must be Present or Absent" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        date: new Date(date),
        status,
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Attendance already marked for this date" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// 📄 Get Attendance by Employee
app.get("/api/attendance/:employeeId", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);

    const records = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});




// 📊 Dashboard Summary
app.get("/api/dashboard", async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentToday = await prisma.attendance.count({
      where: {
        date: today,
        status: "Present",
      },
    });

    const absentToday = await prisma.attendance.count({
      where: {
        date: today,
        status: "Absent",
      },
    });

    res.json({
      totalEmployees,
      presentToday,
      absentToday,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hrms-lite-gamma-three.vercel.app/"
    ],
    credentials: true,
  })
);
