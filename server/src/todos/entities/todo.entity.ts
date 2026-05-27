export type TodoStatus = 'todo' | 'in_progress' | 'done';

export type TodoDocument = {
  key: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
};

export class Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  documents?: TodoDocument[];
  createdAt: string;
  updatedAt: string;
}
