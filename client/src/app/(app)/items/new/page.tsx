'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createItem } from '@/features/items/api';
import { z } from 'zod';
import { useAuth } from 'react-oidc-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const createItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  file: z.any().optional(),
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;

export default function NewItemPage() {
  const router = useRouter();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemSchema),
  });

  async function onSubmit(values: CreateItemFormValues) {
    const token = auth.user?.id_token;

    try {
      await createItem(
        {
          title: values.title,
          description: values.description,
        },
        token,
      );

      toast.success('Todo created successfully');
      router.push('/items');
    } catch {
      toast.error('Failed to create todo');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Item</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>

              <Input
                id="title"
                placeholder="Enter title"
                {...register('title')}
              />

              {errors.title && (
                <p className="text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Enter description"
                {...register('description')}
              />

              {errors.description && (
                <p className="text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>

              <Input id="file" type="file" {...register('file')} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
