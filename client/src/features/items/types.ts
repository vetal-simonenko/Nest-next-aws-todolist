export type Item = {
  id: string;
  title: string;
  description: string;
  fileKey?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateItemInput = {
  title: string;
  description: string;
  fileKey?: string;
};
