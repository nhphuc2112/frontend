export enum RoomStatus {
    available = 'available',
    booked = 'booked',
    maintenance = 'maintenance'
}

export interface Room {
    roomId: number;
    roomNum: string;
    roomType: string;
    price: number;
    status: RoomStatus;
    description: string;
    createdAt: string;
    updatedAt: string;
}
  
// Initialize with some default data
let rooms: Room[] = [
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
    }
];
  
// Helper function to validate room number format
const validateRoomNumber = (roomNum: string): boolean => {
    // Room number should be alphanumeric and not empty
    return /^[A-Za-z0-9]+$/.test(roomNum) && roomNum.length > 0;
};

// Helper function to validate price
const validatePrice = (price: number): boolean => {
    return price > 0 && Number.isFinite(price);
};

export const getRooms = (): Room[] => {
    return [...rooms]; // Return a copy to prevent direct mutation
};
  
export const getRoomByRoomType = (roomType: string): Room | undefined => {
    return rooms.find(room => room.roomType.toLowerCase() === roomType.toLowerCase());
};
  
export const getRoomById = (roomId: number): Room | undefined => {
    return rooms.find(room => room.roomId === roomId);
};
  
export const createRoom = (room: Omit<Room, 'roomId' | 'createdAt' | 'updatedAt'>): Room => {
    // Validate room number
    if (!validateRoomNumber(room.roomNum)) {
        throw new Error('Invalid room number format');
    }

    // Check if room number already exists
    if (rooms.some(r => r.roomNum === room.roomNum)) {
        throw new Error('Room number already exists');
    }

    // Validate price
    if (!validatePrice(room.price)) {
        throw new Error('Invalid price');
    }

    // Validate room type
    if (!room.roomType || room.roomType.trim().length === 0) {
        throw new Error('Room type is required');
    }

    // Validate description
    if (!room.description || room.description.trim().length === 0) {
        throw new Error('Description is required');
    }

    const newRoom: Room = {
        ...room,
        roomId: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    rooms.push(newRoom);
    return newRoom;
};
  
export const updateRoom = (id: number, room: Partial<Room>): Room | undefined => {
    const index = rooms.findIndex(r => r.roomId === id);
    if (index === -1) return undefined;
  
    // Validate room number if provided
    if (room.roomNum && !validateRoomNumber(room.roomNum)) {
        throw new Error('Invalid room number format');
    }

    // Check if new room number conflicts with existing rooms
    if (room.roomNum && rooms.some(r => r.roomNum === room.roomNum && r.roomId !== id)) {
        throw new Error('Room number already exists');
    }

    // Validate price if provided
    if (room.price && !validatePrice(room.price)) {
        throw new Error('Invalid price');
    }

    // Validate room type if provided
    if (room.roomType && room.roomType.trim().length === 0) {
        throw new Error('Room type cannot be empty');
    }

    // Validate description if provided
    if (room.description && room.description.trim().length === 0) {
        throw new Error('Description cannot be empty');
    }

    rooms[index] = {
        ...rooms[index],
        ...room,
        updatedAt: new Date().toISOString(),
    };
    return rooms[index];
};
  
export const deleteRoom = (id: number): boolean => {
    const initialLength = rooms.length;
    rooms = rooms.filter(room => room.roomId !== id);
    return rooms.length < initialLength;
}; 