import { apiClient } from '@/lib/api-client';

import type {
  CreateItemInput,
  Item,
  TodoStatus,
  AddDocumentInput,
  CreateUploadUrlInput,
  CreateUploadUrlResponse,
  CreateDownloadUrlResponse,
  GetItemsResponse,
  GetItemsParams,
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

export async function getItems(params?: GetItemsParams) {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  if (params?.search) {
    searchParams.set('search', params.search);
  }

  const query = searchParams.toString();

  return apiClient<GetItemsResponse>(`/todos${query ? `?${query}` : ''}`);
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

export async function createDocumentDownloadUrl(todoId: string, key: string) {
  return apiClient<CreateDownloadUrlResponse>(
    `/todos/${todoId}/documents/download-url?key=${encodeURIComponent(key)}`,
  );
}

export async function deleteDocument(
  todoId: string,
  key: string,
  token?: string,
) {
  return apiClient<Item>(
    `/todos/${todoId}/documents?key=${encodeURIComponent(key)}`,
    {
      method: 'DELETE',
      token,
    },
  );
}
