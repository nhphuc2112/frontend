export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'available' | 'unavailable';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample data for services
const sampleServices: Service[] = [
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

// In-memory storage
let services: Service[] = [...sampleServices];

export const getServices = (): Service[] => {
  return services;
};

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const createService = (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service => {
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  services.push(newService);
  return newService;
};

export const updateService = (id: string, service: Partial<Service>): Service | undefined => {
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return undefined;

  services[index] = {
    ...services[index],
    ...service,
    updatedAt: new Date().toISOString(),
  };
  return services[index];
};

export const deleteService = (id: string): boolean => {
  const initialLength = services.length;
  services = services.filter(service => service.id !== id);
  return services.length < initialLength;
}; 