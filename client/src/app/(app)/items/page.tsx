import Link from 'next/link';

import { getItems } from '@/features/items/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Todos</h1>
          <p className="text-muted-foreground mt-2">
            Manage your todo items here.
          </p>
        </div>

        <Button asChild>
          <Link href="/items/new">Create Todo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Todos</CardTitle>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">No todos yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {item.description}
                      </p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Status: {item.status}
                      </p>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/items/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
