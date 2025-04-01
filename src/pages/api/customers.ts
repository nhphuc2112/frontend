import type { NextApiRequest, NextApiResponse } from "next";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "../../data/customers";

const API_TOKEN = process.env.API_TOKEN;

// Định nghĩa kiểu dữ liệu Customer
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// Cơ sở dữ liệu giả (thay thế bằng cơ sở dữ liệu thực tế trong môi trường sản xuất)
let customers: Customer[] = [];

// Sample data for customers
const sampleCustomers = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        address: "123 Main St, City",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1987654321",
        address: "456 Oak Ave, Town",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "3",
        name: "Robert Johnson",
        email: "robert.j@example.com",
        phone: "+1122334455",
        address: "789 Pine Rd, Village",
        status: "inactive",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "4",
        name: "Maria Garcia",
        email: "maria.g@example.com",
        phone: "+5544332211",
        address: "321 Elm St, Borough",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "5",
        name: "David Wilson",
        email: "david.w@example.com",
        phone: "+6677889900",
        address: "654 Maple Dr, District",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiểm tra xem API_TOKEN đã được cấu hình chưa
  if (!API_TOKEN) {
    console.error("❌ API_TOKEN not configured!");
    return res.status(500).json({ message: "Server configuration error: API_TOKEN not set" });
  }
  // Thiết lập các header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Xử lý các yêu cầu preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Xử lý các phương thức HTTP khác nhau
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
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// GET /api/customers
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (id) {
    const customer = getCustomerById(String(id));
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json(customer);
  }
  
  // Return sample data if no customers in database
  const customers = getCustomers();
  if (customers.length === 0) {
    return res.status(200).json(sampleCustomers);
  }
  
  return res.status(200).json(customers);
}

// POST /api/customers
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, phone, address, status } = req.body;

  if (!name || !email || !phone || !address || !status) {
    return res.status(400).json({ 
      message: "Missing required fields",
      required: ["name", "email", "phone", "address", "status"]
    });
  }

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone format" });
  }

  try {
    const newCustomer = createCustomer({
      name,
      email,
      phone,
      address,
      status
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create customer"
    });
  }
}

// PUT /api/customers
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { name, email, phone, address, status } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  if (status && !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updatedCustomer = updateCustomer(id as string, {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(status && { status })
    });

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update customer"
    });
  }
}

// DELETE /api/customers
function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  const deleted = deleteCustomer(id as string);
  if (!deleted) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.status(200).json({ message: "Customer deleted successfully" });
}
