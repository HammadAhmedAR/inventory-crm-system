import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { PrismaClient } from "@prisma/client";
import { registerInventoryIpcHandlers } from "./modules/inventory/inventory.ipc";
import { registerFinancialsIpcHandlers } from "./modules/financials/financials.ipc";
import { registerAuthIpcHandlers } from "./modules/auth/auth.ipc";
import { registerPdfIpcHandlers } from "./modules/pdf/pdf.ipc";

// Set database URL dynamically based on environment
const dbPath = is.dev
  ? join(app.getAppPath(), "prisma/dev.db")
  : join(app.getPath("userData"), "dev.db");

process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

// Seed Database with initial dummy data if empty
async function seedDatabaseIfEmpty() {
  const modelsCount = await prisma.vehicleModel.count();
  if (modelsCount > 0) return;

  console.log("Seeding database with mock data...");

  // 1. Create Vehicle Models
  const camry = await prisma.vehicleModel.create({
    data: { make: "Toyota", modelName: "Camry", year: 2023 }
  });
  const crv = await prisma.vehicleModel.create({
    data: { make: "Honda", modelName: "CR-V", year: 2022 }
  });
  const ranger = await prisma.vehicleModel.create({
    data: { make: "Ford", modelName: "Ranger", year: 2024 }
  });
  const cx5 = await prisma.vehicleModel.create({
    data: { make: "Mazda", modelName: "CX-5", year: 2023 }
  });

  // 2. Create Vehicle Chassis
  await prisma.vehicleChassis.createMany({
    data: [
      {
        chassisNumber: "ABC-1234",
        modelId: camry.id,
        color: "White",
        baseQuotingPrice: 10500000.0, // LKR equivalent values
        minSellingPrice: 10200000.0,
        costPrice: 9500000.0,
        saleStatus: "AVAILABLE",
        healthStatus: "READY_FOR_SALE"
      },
      {
        chassisNumber: "XYZ-5678",
        modelId: crv.id,
        color: "Black",
        baseQuotingPrice: 13500000.0,
        minSellingPrice: 13000000.0,
        costPrice: 12000000.0,
        saleStatus: "AVAILABLE",
        healthStatus: "READY_FOR_SALE"
      },
      {
        chassisNumber: "DEF-9012",
        modelId: ranger.id,
        color: "Gray",
        baseQuotingPrice: 18500000.0,
        minSellingPrice: 18000000.0,
        costPrice: 16500000.0,
        saleStatus: "AVAILABLE",
        healthStatus: "READY_FOR_SALE"
      },
      {
        chassisNumber: "GHI-3456",
        modelId: cx5.id,
        color: "Soul Red",
        baseQuotingPrice: 14500000.0,
        minSellingPrice: 14200000.0,
        costPrice: 13000000.0,
        saleStatus: "AVAILABLE",
        healthStatus: "READY_FOR_SALE"
      }
    ]
  });

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      fullName: "David Nguyen",
      phone: "0771234567",
      email: "david@example.com",
      leadSource: "WALK_IN"
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      fullName: "James Harrington",
      phone: "0772345678",
      email: "james@example.com",
      leadSource: "WHATSAPP"
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      fullName: "Priya Sharma",
      phone: "0773456789",
      email: "priya@example.com",
      leadSource: "REFERRAL"
    }
  });

  // 4. Create Customer Interactions & Tasks
  const today = new Date();

  // Overdue Task
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await prisma.followUpTask.create({
    data: {
      customerId: customer1.id,
      title: "Send vehicle brochures via WhatsApp",
      actionType: "WHATSAPP",
      dueDate: yesterday,
      dueTime: "11:00 AM",
      status: "PENDING"
    }
  });

  // Today Tasks
  await prisma.followUpTask.create({
    data: {
      customerId: customer2.id,
      title: "Follow up on grey Ranger price quote",
      actionType: "CALL",
      dueDate: today,
      dueTime: "02:00 PM",
      status: "PENDING"
    }
  });

  await prisma.followUpTask.create({
    data: {
      customerId: customer3.id,
      title: "Send leasing quotes via WhatsApp",
      actionType: "WHATSAPP",
      dueDate: today,
      dueTime: "05:00 PM",
      status: "PENDING"
    }
  });

  // 5. Create Daily Expenses
  await prisma.dailyExpense.create({
    data: {
      category: "OFFICE_UTILITIES",
      description: "Electricity bill payment",
      amount: 14500.0,
      loggedBy: "Admin"
    }
  });

  console.log("Database seeded successfully!");
}

function registerIpcHandlers() {
  ipcMain.on("window:minimize", (event) => BrowserWindow.fromWebContents(event.sender)?.minimize());
  ipcMain.on("window:toggle-maximize", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    if (window.isMaximized()) window.unmaximize(); else window.maximize();
  });
  ipcMain.on("window:close", (event) => BrowserWindow.fromWebContents(event.sender)?.close());

  // CRM IPC Handlers
  ipcMain.handle("crm:getTasks", async () => {
    return prisma.followUpTask.findMany({
      include: {
        customer: true
      },
      orderBy: [
        { dueDate: "asc" },
        { dueTime: "asc" }
      ]
    });
  });

  ipcMain.handle("crm:quickLog", async (_, data) => {
    // 1. Find or create customer by phone
    const customer = await prisma.customer.upsert({
      where: { phone: data.phone },
      update: { fullName: data.fullName },
      create: {
        fullName: data.fullName,
        phone: data.phone,
        leadSource: "WALK_IN"
      }
    });

    // 2. Log Interaction
    await prisma.customerInteraction.create({
      data: {
        customerId: customer.id,
        customerRemark: data.customerRemark || "Initial walk-in logged",
        actionTag: data.actionTag || "CALL_BACK"
      }
    });

    // 3. Log Quote if interest registered
    if (data.chassisNumber && data.quotedPrice) {
      await prisma.prospectQuote.create({
        data: {
          customerId: customer.id,
          chassisNumber: data.chassisNumber,
          quotedPrice: parseFloat(data.quotedPrice)
        }
      });
      // Optionally update vehicle saleStatus to RESERVED / IN_NEGOTIATION
    }

    // 4. Create FollowUpTask
    if (data.dueDate) {
      const parts = data.dueDate.split("T");
      const datePart = parts[0];
      const timePart = parts[1] ? parts[1].substring(0, 5) : null;

      await prisma.followUpTask.create({
        data: {
          customerId: customer.id,
          title: `Follow up with ${data.fullName} on interest`,
          actionType: data.actionTag === "SEND_WHATSAPP_DETAILS" || data.actionTag === "SEND_PRICE" ? "WHATSAPP" : "CALL",
          dueDate: new Date(datePart),
          dueTime: timePart,
          status: "PENDING"
        }
      });
    }

    return { customerId: customer.id };
  });

  ipcMain.handle("crm:completeTask", async (_, taskId) => {
    await prisma.followUpTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED" }
    });
  });

  ipcMain.handle("crm:getCustomerTimeline", async (_, customerId) => {
    return prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        interactions: {
          orderBy: { createdAt: "desc" }
        },
        quotes: {
          include: {
            chassis: {
              include: {
                model: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        sales: {
          orderBy: { saleDate: "desc" }
        }
      }
    });
  });

  ipcMain.handle("crm:getCustomers", async (_, search = "") => {
    const query = String(search).trim();
    return prisma.customer.findMany({
      where: query ? { OR: [{ fullName: { contains: query } }, { phone: { contains: query } }, { email: { contains: query } }] } : undefined,
      include: { _count: { select: { interactions: true, quotes: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle("crm:getAvailableVehicles", async () => {
    return prisma.vehicleChassis.findMany({
      where: { saleStatus: "AVAILABLE" },
      include: {
        model: true
      }
    });
  });

  ipcMain.handle("crm:addRemark", async (_, data) => {
    await prisma.customerInteraction.create({
      data: {
        customerId: data.customerId,
        customerRemark: data.remark,
        actionTag: data.actionTag
      }
    });
  });

  // Financials IPC Handlers
  ipcMain.handle("financials:getTodaySummary", async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Sum today's vehicle sales
    const sales = await prisma.vehicleSale.findMany({
      where: {
        saleDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Sum today's expenses
    const expenses = await prisma.dailyExpense.findMany({
      where: {
        expenseDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const revenue = sales.reduce((sum, item) => sum + item.finalSalePrice, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return {
      revenue,
      expenses: totalExpenses,
      vehiclesSold: sales.length,
      netCashflow: revenue - totalExpenses
    };
  });

  ipcMain.handle("agreements:get-options", async () => {
    return prisma.vehicleChassis.findMany({
      where: { saleStatus: { in: ["SOLD", "RESERVED"] } },
      include: {
        model: true,
        salesRecord: { include: { customer: true } },
        quotes: {
          where: { status: { in: ["ACTIVE", "ACCEPTED"] } },
          include: { customer: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  });

  registerInventoryIpcHandlers(prisma);
  registerFinancialsIpcHandlers(prisma);
  registerAuthIpcHandlers(prisma);
  registerPdfIpcHandlers(prisma);
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    backgroundColor: "#0f172a",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.omnidrive");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize DB, seed, and register IPC handlers
  await seedDatabaseIfEmpty();
  registerIpcHandlers();

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
