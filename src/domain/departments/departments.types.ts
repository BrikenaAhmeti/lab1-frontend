export type Department = {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentRelationItem = Record<string, unknown>;

export type CreateDepartmentDTO = {
  name: string;
  location: string;
  description?: string;
};

export type UpdateDepartmentDTO = Partial<CreateDepartmentDTO>;
