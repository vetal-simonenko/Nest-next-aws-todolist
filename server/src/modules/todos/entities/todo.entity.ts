export type TodoStatus = 'todo' | 'in_progress' | 'done';

export type TodoDocument = {
  key: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
};

export interface Todo {
  id: string;
  entityType: 'TODO';
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
  documents?: {
    key: string;
    fileName: string;
    contentType: string;
    uploadedAt: string;
  }[];
}
