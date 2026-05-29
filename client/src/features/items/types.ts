export type TodoStatus = 'todo' | 'in_progress' | 'done';

export type ItemDocument = {
  key: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
};

export type Item = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  documents?: ItemDocument[];
  createdAt: string;
  updatedAt: string;
};

export type GetItemsResponse = {
  items: Item[];
  nextCursor: string | null;
};

export type GetItemsParams = {
  limit?: number;
  cursor?: string;
  search?: string;
};

export type CreateItemInput = {
  title: string;
  description: string;
  status?: TodoStatus;
};

export type CreateUploadUrlInput = {
  fileName: string;
  contentType: string;
};

export type CreateUploadUrlResponse = {
  uploadUrl: string;
  key: string;
  fileName: string;
  contentType: string;
};

export type AddDocumentInput = {
  key: string;
  fileName: string;
  contentType: string;
};

export type CreateDownloadUrlResponse = {
  downloadUrl: string;
  key: string;
  fileName: string;
  contentType: string;
};
