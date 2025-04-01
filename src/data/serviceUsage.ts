export interface ServiceUsage {
    usageId: number;
    bookingId: number;
    serviceId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

let serviceUsages: ServiceUsage[] = [];
  
export const recordServiceUsage = (serviceUsage: Omit<ServiceUsage, 'usageId' | 'createdAt' | 'updatedAt'>): ServiceUsage => {
    const newServiceUsage: ServiceUsage = {
      ...serviceUsage,
      usageId: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    serviceUsages.push(newServiceUsage);
    return newServiceUsage;
};

