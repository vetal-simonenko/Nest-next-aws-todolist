'use client';

import { useState } from 'react';
import Link from 'next/link';

import { getItems } from '@/features/items/api';
import { Button } from '@/components/ui/button';

import type { Item } from '@/features/items/types';
import { Input } from '@/components/ui/input';

type ItemsListProps = {
  initialItems: Item[];
  initialNextCursor: string | null;
  limit: number;
};

export function ItemsList({
  initialItems,
  initialNextCursor,
  limit,
}: ItemsListProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    const nextSearch = searchInput.trim();

    setIsLoading(true);

    try {
      const data = await getItems({
        limit,
        search: nextSearch,
      });

      setActiveSearch(nextSearch);
      setItems(data.items);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await getItems({
        limit,
        cursor: nextCursor,
        search: activeSearch,
      });

      setItems((currentItems) => [...currentItems, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          aria-label="Search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search todos..."
        />

        <Button type="button" onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No todos found.</p>
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

      {nextCursor ? (
        <Button
          type="button"
          variant="secondary"
          onClick={handleLoadMore}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load more'}
        </Button>
      ) : null}
    </div>
  );
}
