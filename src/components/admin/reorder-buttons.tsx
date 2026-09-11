import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

export function ReorderButtons({
  action,
  id,
  disabledUp,
  disabledDown,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  disabledUp?: boolean;
  disabledDown?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label="Mover para cima"
          isDisabled={disabledUp}
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label="Mover para baixo"
          isDisabled={disabledDown}
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
