import type { NextApiRequest, NextApiResponse } from "next";
import { getServices, getServiceById, createService, updateService, deleteService } from "../../data/services";

const API_TOKEN = process.env.API_TOKEN;

// Sample data for services
const sampleServices = [
    {
        id: "1",
        name: "Room Service",
        description: "24/7 food and beverage delivery to your room",
        price: 15.00,
        category: "food",
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "2",
        name: "Laundry Service",
        description: "Same-day laundry and dry cleaning service",
        price: 25.00,
        category: "housekeeping",
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "3",
        name: "Airport Transfer",
        description: "Private car service to and from the airport",
        price: 50.00,
        category: "transportation",
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "4",
        name: "Spa Treatment",
        description: "Relaxing massage and spa treatments",
        price: 80.00,
        category: "wellness",
        status: "unavailable",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "5",
        name: "Tour Guide",
        description: "Professional local tour guide service",
        price: 100.00,
        category: "activities",
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Debug API token configuration
console.log('API Token configured:', !!API_TOKEN);
console.log('API Token value:', API_TOKEN);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if API_TOKEN is configured
  if (!API_TOKEN) {
    console.error("❌ API_TOKEN not configured!");
    return res.status(500).json({ message: "Server configuration error: API_TOKEN not set" });
  }
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

// get services api
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (id) {
    const service = getServiceById(String(id));
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.status(200).json(service);
  }
  
  // Return sample data if no services in database
  const services = getServices();
  if (services.length === 0) {
    return res.status(200).json(sampleServices);
  }
  
  return res.status(200).json(services);
}

// post services api
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, price, category, status } = req.body;

  if (!name || !description || !price || !category || !status) {
    return res.status(400).json({ 
      message: "Missing required fields",
      required: ["name", "description", "price", "category", "status"]
    });
  }

  // Validate price is a number
  if (isNaN(Number(price))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  // Validate status
  if (!["available", "unavailable"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const newService = createService({
      name,
      description,
      price: Number(price),
      category,
      status
    });

    return res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create service"
    });
  }
}

// PUT /api/services
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { name, description, price, category, status } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Service ID is required" });
  }

  // Validate price if provided
  if (price && isNaN(Number(price))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  // Validate status if provided
  if (status && !["available", "unavailable"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updatedService = updateService(id as string, {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: Number(price) }),
      ...(category && { category }),
      ...(status && { status })
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update service"
    });
  }
}

// DELETE /api/services
function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Service ID is required" });
  }

  const deleted = deleteService(id as string);
  if (!deleted) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.status(200).json({ message: "Service deleted successfully" });
}