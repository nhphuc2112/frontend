import type { NextApiRequest, NextApiResponse } from "next";
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking, BookingStatus } from "../../data/bookings";

const API_TOKEN = process.env.API_TOKEN;

// Ghi nhật ký cấu hình API token
console.log('API Token được cấu hình:', !!API_TOKEN);
console.log('Giá trị API Token:', API_TOKEN);

// Sample data for bookings
const sampleBookings = [
    {
        bookingId: 1,
        customerId: 1,
        roomId: 101,
        checkInDate: new Date(Date.now() + 86400000).toISOString(),
        checkOutDate: new Date(Date.now() + 172800000).toISOString(),
        status: BookingStatus.confirmed,
        totalPrice: 100.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        bookingId: 2,
        customerId: 2,
        roomId: 102,
        checkInDate: new Date(Date.now() + 259200000).toISOString(),
        checkOutDate: new Date(Date.now() + 345600000).toISOString(),
        status: BookingStatus.pending,
        totalPrice: 150.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        bookingId: 3,
        customerId: 3,
        roomId: 201,
        checkInDate: new Date(Date.now() - 86400000).toISOString(),
        checkOutDate: new Date(Date.now() + 86400000).toISOString(),
        status: BookingStatus.checked_in,
        totalPrice: 300.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        bookingId: 4,
        customerId: 4,
        roomId: 202,
        checkInDate: new Date(Date.now() - 172800000).toISOString(),
        checkOutDate: new Date(Date.now() - 86400000).toISOString(),
        status: BookingStatus.completed,
        totalPrice: 160.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        bookingId: 5,
        customerId: 5,
        roomId: 301,
        checkInDate: new Date(Date.now() + 432000000).toISOString(),
        checkOutDate: new Date(Date.now() + 518400000).toISOString(),
        status: BookingStatus.cancelled,
        totalPrice: 110.00,
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
        const booking = getBookingById(Number(id));
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json(booking);
    }
    
    // Return sample data if no bookings in database
    const bookings = getBookings();
    if (bookings.length === 0) {
        return res.status(200).json(sampleBookings);
    }
    
    return res.status(200).json(bookings);
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { customerId, roomId, checkInDate, checkOutDate, totalPrice, status } = req.body;

    if (!customerId || !roomId || !checkInDate || !checkOutDate || !totalPrice) {
        return res.status(400).json({ 
            message: "Missing required fields",
            required: ["customerId", "roomId", "checkInDate", "checkOutDate", "totalPrice"]
        });
    }

    try {
        const newBooking = createBooking({
            customerId,
            roomId,
            checkInDate,
            checkOutDate,
            totalPrice,
            status: status || BookingStatus.pending
        });

        return res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : "Failed to create booking"
        });
    }
}

function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const { customerId, roomId, checkInDate, checkOutDate, totalPrice, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
    }

    try {
        const updatedBooking = updateBooking(Number(id), {
            ...(customerId && { customerId }),
            ...(roomId && { roomId }),
            ...(checkInDate && { checkInDate }),
            ...(checkOutDate && { checkOutDate }),
            ...(totalPrice && { totalPrice }),
            ...(status && { status })
        });

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : "Failed to update booking"
        });
    }
}

function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
    }
    
    const deleted = deleteBooking(Number(id));
    
    if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking deleted successfully" });
}
