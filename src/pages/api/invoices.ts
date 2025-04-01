import type { NextApiRequest, NextApiResponse } from "next";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  calculateInvoiceTotals,
} from "../../data/invoices";

const API_TOKEN = process.env.API_TOKEN;
type InvoiceItem = {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
};

type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "cancelled";
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Mock database (replace with actual database in production)
let invoices: Invoice[] = [];

// Sample data for invoices
const sampleInvoices: Invoice[] = [
    {
        id: "1",
        customerId: "1",
        customerName: "John Doe",
        items: [
            {
                serviceId: "1",
                serviceName: "Room Service",
                quantity: 2,
                price: 15.00,
                total: 30.00
            },
            {
                serviceId: "2",
                serviceName: "Laundry Service",
                quantity: 1,
                price: 25.00,
                total: 25.00
            }
        ],
        subtotal: 55.00,
        tax: 5.50,
        total: 60.50,
        status: "paid",
        paymentMethod: "credit_card",
        notes: "Room 101",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "2",
        customerId: "2",
        customerName: "Jane Smith",
        items: [
            {
                serviceId: "3",
                serviceName: "Airport Transfer",
                quantity: 1,
                price: 50.00,
                total: 50.00
            }
        ],
        subtotal: 50.00,
        tax: 5.00,
        total: 55.00,
        status: "pending",
        paymentMethod: "bank_transfer",
        notes: "Room 102",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "3",
        customerId: "3",
        customerName: "Mike Johnson",
        items: [
            {
                serviceId: "4",
                serviceName: "Spa Treatment",
                quantity: 2,
                price: 80.00,
                total: 160.00
            },
            {
                serviceId: "5",
                serviceName: "Tour Guide",
                quantity: 1,
                price: 100.00,
                total: 100.00
            }
        ],
        subtotal: 260.00,
        tax: 26.00,
        total: 286.00,
        status: "paid",
        paymentMethod: "cash",
        notes: "Room 201",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "4",
        customerId: "4",
        customerName: "Sarah Wilson",
        items: [
            {
                serviceId: "1",
                serviceName: "Room Service",
                quantity: 3,
                price: 15.00,
                total: 45.00
            }
        ],
        subtotal: 45.00,
        tax: 4.50,
        total: 49.50,
        status: "cancelled",
        paymentMethod: undefined,
        notes: "Room 202",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "5",
        customerId: "5",
        customerName: "David Brown",
        items: [
            {
                serviceId: "2",
                serviceName: "Laundry Service",
                quantity: 2,
                price: 25.00,
                total: 50.00
            }
        ],
        subtotal: 50.00,
        tax: 5.00,
        total: 55.00,
        status: "pending",
        paymentMethod: "credit_card",
        notes: "Room 301",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiem tra API T0ken da duoc cau hinh chua
  if (!API_TOKEN) {
    console.error("❌ Chua config api token kia` ╰（‵□′）╯");
    return res
      .status(500)
      .json({ message: "Server configuration error: API_TOKEN is not set" });
  }
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).json({ message: "ko tim` thay phuong thuc" });
  }
}

// get invoice api
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (id) {
    const invoice = getInvoiceById(String(id));
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    return res.status(200).json(invoice);
  }

  // Return sample data if no invoices in database
  const invoices = getInvoices();
  if (invoices.length === 0) {
    // Initialize the mock database with sample data
    invoices.push(...sampleInvoices);
    return res.status(200).json(sampleInvoices);
  }

  return res.status(200).json(invoices);
}

// post invoices api
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { customerId, customerName, items, tax, status, paymentMethod, notes } = req.body;

  if (!customerId || !customerName || !items || !Array.isArray(items) || items.length === 0 || !status) {
    return res.status(400).json({ 
      message: "Missing required fields",
      required: ["customerId", "customerName", "items", "status"]
    });
  }

  if (!["pending", "paid", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const { subtotal, total } = calculateInvoiceTotals(items, tax || 0);

  try {
    const newInvoice = createInvoice({
      customerId,
      customerName,
      items,
      subtotal,
      tax: tax || 0,
      total,
      status,
      paymentMethod,
      notes
    });

    return res.status(201).json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create invoice"
    });
  }
}

// put invoices api
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { customerId, customerName, items, tax, status, paymentMethod, notes } =
    req.body;

  if (!id) {
    return res.status(400).json({ message: "Ko tim` thay invoices id nhe" });
  }
  if (status && !["pending", "paid", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Them trang thai hoat dong kia` ma  ╰（‵□′）╯"  });
  }
  let subtotal = 0;
  let total = 0;
  if (items && Array.isArray(items)) {
    const totals = calculateInvoiceTotals(items, tax || 0);
    subtotal = totals.subtotal;
    total = totals.total;
  }

  const updatedInvoice = updateInvoice(id as string, {
    customerId,
    customerName,
    items,
    subtotal,
    tax: tax || 0,
    total,
    status,
    paymentMethod,
    notes,
  });

  if (!updatedInvoice) {
    return res.status(404).json({ message: "ko tim` thay invoices id nhe" });
  }

  return res.status(200).json(updatedInvoice);
}

// delete invoices api
function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  // Find the invoice in the sample data
  const invoiceIndex = sampleInvoices.findIndex(inv => inv.id === id);
  if (invoiceIndex === -1) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  // Remove the invoice from the sample data
  sampleInvoices.splice(invoiceIndex, 1);

  return res.status(200).json({ message: "Invoice deleted successfully" });
}
