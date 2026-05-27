export type TodoStatus = 'todo' | 'in_progress' | 'done';

export class Todo {
    id: string;
    title: string;
    description?: string;
    status: TodoStatus;
    createdAt: string;
    updatedAt: string;
}