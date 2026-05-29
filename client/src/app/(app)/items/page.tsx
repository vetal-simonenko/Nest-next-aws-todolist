import Link from 'next/link';

import { getItems } from '@/features/items/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemsList } from '@/components/items-list';
import { ITEMS_PAGE_SIZE } from '@/features/items/constants';

const ITEMS_LIMIT = ITEMS_PAGE_SIZE;

export default async function ItemsPage() {
  const data = await getItems({ limit: ITEMS_LIMIT });

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
          <ItemsList
            initialItems={data.items}
            initialNextCursor={data.nextCursor}
            limit={ITEMS_LIMIT}
          />
        </CardContent>
      </Card>
    </div>
  );
}
