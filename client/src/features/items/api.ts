import { apiClient } from '@/lib/api-client';

import type {
  CreateItemInput,
  Item,
  TodoStatus,
  AddDocumentInput,
  CreateUploadUrlInput,
  CreateUploadUrlResponse,
} from './types';

export async function updateItem(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    status: TodoStatus;
  }>,
  token?: string,
) {
  return apiClient<Item>(`/todos/${id}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

export async function deleteItem(id: string, token?: string) {
  return apiClient<Item>(`/todos/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createItem(input: CreateItemInput, token?: string) {
  return apiClient<Item>('/todos', {
    method: 'POST',
    body: {
      title: input.title,
      description: input.description,
      status: 'todo',
    },
    token,
  });
}

export async function getItem(id: string, token?: string) {
  return apiClient<Item>(`/todos/${id}`, {
    token,
  });
}

export async function getItems() {
  return apiClient<Item[]>('/todos');
}

export async function createDocumentUploadUrl(
  todoId: string,
  input: CreateUploadUrlInput,
  token?: string,
) {
  return apiClient<CreateUploadUrlResponse>(
    `/todos/${todoId}/documents/upload-url`,
    {
      method: 'POST',
      body: input,
      token,
    },
  );
}

export async function addDocument(
  todoId: string,
  input: AddDocumentInput,
  token?: string,
) {
  return apiClient<Item>(`/todos/${todoId}/documents`, {
    method: 'POST',
    body: input,
    token,
  });
}
