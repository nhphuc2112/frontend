import type { NextApiRequest, NextApiResponse } from "next";
import { getRoomByRoomType, getRooms, createRoom, updateRoom, deleteRoom } from "../../data/rooms";
import { RoomStatus } from "../../data/rooms";

const API_TOKEN = process.env.API_TOKEN;

// Sample data for rooms
const sampleRooms = [
    {
        roomId: 101,
        roomNum: "101A",
        roomType: "Single",
        price: 50.00,
        status: RoomStatus.available,
        description: "Single room with a view.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        roomId: 102,
        roomNum: "102B",
        roomType: "Double",
        price: 75.00,
        status: RoomStatus.booked,
        description: "Double room near the elevator.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        roomId: 201,
        roomNum: "201A",
        roomType: "Suite",
        price: 150.00,
        status: RoomStatus.maintenance,
        description: "Luxury suite with balcony.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        roomId: 202,
        roomNum: "202B",
        roomType: "Double",
        price: 80.00,
        status: RoomStatus.booked,
        description: "Double room under renovation.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        roomId: 301,
        roomNum: "301A",
        roomType: "Single",
        price: 55.00,
        status: RoomStatus.maintenance,
        description: "Standard single room.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check API token
  if (!API_TOKEN) {
    console.error("❌ API_TOKEN not configured!");
    return res.status(500).json({ message: "Server configuration error: API_TOKEN not set" });
  }

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// GET /api/rooms
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { roomType } = req.query;
  
  if (roomType) {
    const room = getRoomByRoomType(roomType as string);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json(room);
  }
  
  // Return sample data if no rooms in database
  const rooms = getRooms();
  if (rooms.length === 0) {
    return res.status(200).json(sampleRooms);
  }
  
  return res.status(200).json(rooms);
}

// POST /api/rooms
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { roomNum, roomType, price, status, description } = req.body;

  // Validate required fields
  if (!roomNum || !roomType || !price || !description) {
    return res.status(400).json({ 
      message: "Missing required fields",
      required: ["roomNum", "roomType", "price", "description"]
    });
  }

  // Validate price is a number
  if (isNaN(Number(price))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  // Validate status
  if (status && !Object.values(RoomStatus).includes(status)) {
    return res.status(400).json({ 
      message: "Invalid status",
      validStatuses: Object.values(RoomStatus)
    });
  }

  try {
    const newRoom = createRoom({
      roomNum,
      roomType,
      price: Number(price),
      status: status || RoomStatus.available,
      description
    });

    return res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create room"
    });
  }
}

// PUT /api/rooms
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { roomNum, roomType, price, status, description } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  // Validate price if provided
  if (price && isNaN(Number(price))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  // Validate status if provided
  if (status && !Object.values(RoomStatus).includes(status)) {
    return res.status(400).json({ 
      message: "Invalid status",
      validStatuses: Object.values(RoomStatus)
    });
  }

  try {
    const updatedRoom = updateRoom(Number(id), {
      ...(roomNum && { roomNum }),
      ...(roomType && { roomType }),
      ...(price && { price: Number(price) }),
      ...(status && { status }),
      ...(description && { description })
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update room"
    });
  }
}

// DELETE /api/rooms
function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  const deleted = deleteRoom(Number(id));
  if (!deleted) {
    return res.status(404).json({ message: "Room not found" });
  }

  return res.status(200).json({ message: "Room deleted successfully" });
}