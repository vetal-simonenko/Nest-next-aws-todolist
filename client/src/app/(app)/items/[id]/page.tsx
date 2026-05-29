'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from 'react-oidc-context';

import {
  addDocument,
  createDocumentUploadUrl,
  deleteItem,
  getItem,
  updateItem,
  createDocumentDownloadUrl,
  deleteDocument,
} from '@/features/items/api';
import { uploadFileToS3 } from '@/features/items/upload-file';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TodoStatus, Item } from '@/features/items/types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function ItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const auth = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      const token = auth.user?.id_token;

      if (!token) return;

      const data = await getItem(params.id, token);

      setItem(data);
      setIsLoading(false);
    }

    loadItem();
  }, [auth.user?.id_token, params.id]);

  async function handleStatusChange(status: TodoStatus) {
    const token = auth.user?.id_token;

    if (!token || !item) return;

    try {
      const updatedItem = await updateItem(item.id, { status }, token);

      setItem(updatedItem);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleDelete() {
    const token = auth.user?.id_token;

    if (!token || !item) return;

    try {
      await deleteItem(item.id, token);

      toast.success('Todo deleted');
      router.push('/items');
    } catch {
      toast.error('Failed to delete todo');
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const token = auth.user?.id_token;

    if (!file || !token || !item) return;

    setIsUploading(true);

    try {
      const uploadData = await createDocumentUploadUrl(
        item.id,
        {
          fileName: file.name,
          contentType: file.type,
        },
        token,
      );

      await uploadFileToS3(uploadData.uploadUrl, file);

      const updatedItem = await addDocument(
        item.id,
        {
          key: uploadData.key,
          fileName: uploadData.fileName,
          contentType: uploadData.contentType,
        },
        token,
      );

      setItem(updatedItem);
      toast.success('File uploaded');
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleDownload(key: string) {
    if (!item) return;

    try {
      const data = await createDocumentDownloadUrl(item.id, key);

      window.open(data.downloadUrl, '_blank');
    } catch {
      toast.error('Failed to download file');
    }
  }

  async function handleDeleteDocument(key: string) {
    const updatedItem = await deleteDocument(item!.id, key);

    setItem(updatedItem);
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!item) {
    return <p>Todo not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/items">Back to todos</Link>
        </Button>

        <Button asChild>
          <Link href={`/items/${item.id}/edit`}>Edit todo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{item.description}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>

            <Select
              value={item.status}
              onValueChange={(value) => handleStatusChange(value as TodoStatus)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div>
              <h3 className="font-medium">Documents</h3>
              <p className="text-muted-foreground text-sm">
                Upload files for this.
              </p>
            </div>

            <Input
              aria-label="file"
              type="file"
              disabled={isUploading}
              onChange={handleFileChange}
            />

            {isUploading && (
              <p className="text-muted-foreground text-sm">Uploading...</p>
            )}

            {item.documents?.length ? (
              <div className="space-y-2">
                {item.documents.map((document) => (
                  <div
                    key={document.key}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p>{document.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        {document.contentType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document.key)}
                      >
                        Download
                      </Button>
                      <Button
                        aria-label="Delete"
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Delete document"
                        onClick={() => handleDeleteDocument(document.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No documents uploaded yet.
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <p>Status: {item.status}</p>
            <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
