'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

import { getItem, updateItem } from '@/features/items/api';
import type { Item, TodoStatus } from '@/features/items/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const token = auth.user?.id_token;

      if (!token) return;

      const data = await getItem(params.id, token);

      setItem(data);
      setTitle(data.title);
      setDescription(data.description);
      setStatus(data.status);
      setIsLoading(false);
    }

    loadItem();
  }, [auth.user?.id_token, params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = auth.user?.id_token;

    if (!token || !item) return;

    setIsSaving(true);

    try {
      await updateItem(
        item.id,
        {
          title,
          description,
          status,
        },
        token,
      );

      toast.success('Todo updated');
      router.push(`/items/${item.id}`);
    } catch {
      toast.error('Failed to update todo');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!item) {
    return <p>Todo not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/items/${item.id}`}>Back to todo</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Todo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>

              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>

              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TodoStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
