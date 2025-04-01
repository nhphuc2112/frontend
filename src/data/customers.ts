export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Sample data for customers
const sampleCustomers: Customer[] = [
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

// In-memory storage
let customers: Customer[] = [...sampleCustomers];

export const getCustomers = (): Customer[] => {
  return customers;
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const createCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  return newCustomer;
};

export const updateCustomer = (id: string, customer: Partial<Customer>): Customer | undefined => {
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  customers[index] = {
    ...customers[index],
    ...customer,
    updatedAt: new Date().toISOString(),
  };
  return customers[index];
};

export const deleteCustomer = (id: string): boolean => {
  const initialLength = customers.length;
  customers = customers.filter(customer => customer.id !== id);
  return customers.length < initialLength;
}; 