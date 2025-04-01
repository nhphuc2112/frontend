import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../../data/users";

const API_TOKEN = process.env.API_TOKEN;

// Sample data for users
const sampleUsers = [
    {
        userId: 1,
        username: "admin",
        email: "admin@hotel.com",
        password: "hashed_password_here",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        userId: 2,
        username: "receptionist",
        email: "receptionist@hotel.com",
        password: "hashed_password_here",
        role: "receptionist",
        firstName: "John",
        lastName: "Smith",
        phone: "+1987654321",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        userId: 3,
        username: "housekeeper",
        email: "housekeeper@hotel.com",
        password: "hashed_password_here",
        role: "housekeeper",
        firstName: "Maria",
        lastName: "Garcia",
        phone: "+1122334455",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        userId: 4,
        username: "manager",
        email: "manager@hotel.com",
        password: "hashed_password_here",
        role: "manager",
        firstName: "David",
        lastName: "Wilson",
        phone: "+5544332211",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        userId: 5,
        username: "maintenance",
        email: "maintenance@hotel.com",
        password: "hashed_password_here",
        role: "maintenance",
        firstName: "Robert",
        lastName: "Johnson",
        phone: "+6677889900",
        status: "active",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!API_TOKEN) {
        console.error("❌ API_TOKEN not configured!");
        return res.status(500).json({ message: "Server configuration error: API_TOKEN not set" });
    }

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

function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    
    if (id) {
        const user = getUserById(String(id));
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    
    // Return sample data if no users in database
    const users = getUsers();
    if (users.length === 0) {
        return res.status(200).json(sampleUsers);
    }
    
    return res.status(200).json(users);
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { username, email, password, role, firstName, lastName, phone } = req.body;

    if (!username || !email || !password || !role || !firstName || !lastName || !phone) {
        return res.status(400).json({ 
            message: "Missing required fields",
            required: ["username", "email", "password", "role", "firstName", "lastName", "phone"]
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate role
    const validRoles = ["admin", "receptionist", "housekeeper", "manager", "maintenance"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ 
            message: "Invalid role",
            validRoles
        });
    }

    try {
        const newUser = createUser({
            username,
            email,
            password,
            role,
            firstName,
            lastName,
            phone,
            status: "active"
        });

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : "Failed to create user"
        });
    }
}

function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const { email, role, firstName, lastName, phone, status, password } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    // Validate email if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
    }

    // Validate role if provided
    if (role) {
        const validRoles = ["admin", "receptionist", "housekeeper", "manager", "maintenance"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: "Invalid role",
                validRoles
            });
        }
    }

    try {
        const updatedUser = updateUser(String(id), {
            ...(email && { email }),
            ...(password && { password }),
            ...(role && { role }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(status && { status })
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : "Failed to update user"
        });
    }
}

function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const deleted = deleteUser(String(id));
    if (!deleted) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
}