"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";

import {
  type ReorderAction,
  useReorder,
} from "@/components/admin/reorderable-rows";
import { Button } from "@/components/ui/button";

/** Up/down arrows for a row of an `AdminDataTable` that has `reorder` set. */
export function ReorderButtons({
  action,
  id,
}: {
  action: ReorderAction;
  id: string;
}) {
  const { move, canMove } = useReorder();

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Mover para cima"
        isDisabled={!canMove(id, "up")}
        onPress={() => move(id, "up", action)}
      >
        <ArrowUpIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Mover para baixo"
        isDisabled={!canMove(id, "down")}
        onPress={() => move(id, "down", action)}
      >
        <ArrowDownIcon className="size-3.5" />
      </Button>
    </div>
  );
}
