export enum BookingStatus {
    pending = 'pending',
    confirmed = 'confirmed',
    checked_in = 'checked_in',
    completed = 'completed',
    cancelled = 'cancelled'
}

export interface Booking {
    bookingId: number;
    customerId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

// Sample data for bookings
const sampleBookings: Booking[] = [
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

// In-memory storage
let bookings: Booking[] = [...sampleBookings];

export const getBookings = (): Booking[] => {
    return bookings;
};

export const getBookingById = (id: number): Booking | undefined => {
    return bookings.find(booking => booking.bookingId === id);
};

export const createBooking = (booking: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>): Booking => {
    const newBooking: Booking = {
        ...booking,
        bookingId: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    return newBooking;
};

export const updateBooking = (id: number, booking: Partial<Booking>): Booking | undefined => {
    const index = bookings.findIndex(b => b.bookingId === id);
    if (index === -1) return undefined;

    bookings[index] = {
        ...bookings[index],
        ...booking,
        updatedAt: new Date().toISOString(),
    };
    return bookings[index];
};

export const deleteBooking = (id: number): boolean => {
    const initialLength = bookings.length;
    bookings = bookings.filter(booking => booking.bookingId !== id);
    return bookings.length < initialLength;
};
