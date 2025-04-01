export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'receptionist' | 'housekeeper' | 'manager' | 'maintenance';
  firstName: string;
  lastName: string;
  phone: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

// Sample data for users
const sampleUsers: User[] = [
    {
        id: "1",
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
        id: "2",
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
        id: "3",
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
        id: "4",
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
        id: "5",
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

// In-memory storage
let users: User[] = [...sampleUsers];

export const getUsers = (): User[] => {
  return users;
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const createUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): User => {
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, user: Partial<User>): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;

  users[index] = {
    ...users[index],
    ...user,
    updatedAt: new Date().toISOString(),
  };
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length < initialLength;
}; 