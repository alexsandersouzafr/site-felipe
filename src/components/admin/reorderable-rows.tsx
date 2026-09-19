"use client";

import {
  Children,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";

export type ReorderDirection = "up" | "down";
export type ReorderAction = (formData: FormData) => void | Promise<void>;

type ReorderContextValue = {
  move: (
    id: string,
    direction: ReorderDirection,
    action: ReorderAction,
  ) => void;
  canMove: (id: string, direction: ReorderDirection) => boolean;
};

const ReorderContext = createContext<ReorderContextValue | null>(null);

export function useReorder() {
  const context = useContext(ReorderContext);

  if (!context) {
    throw new Error(
      "ReorderButtons must be rendered inside a reorderable table.",
    );
  }

  return context;
}

const SLIDE_MS = 320;
const SLIDE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
// Rows are transparent, so while two of them cross each other they need a
// background; the row the user moved also sits on top and is tinted.
const MOVED_ROW_CLASSES = ["relative", "z-[1]", "bg-muted"];
const SETTLING_ROW_CLASSES = ["relative", "bg-background"];

function collectRows(children: ReactNode) {
  const rows: ReactElement[] = [];

  // `Children.forEach` keeps the original keys (`toArray`/`map` prefix them).
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.key !== null) {
      rows.push(child);
    }
  });

  return rows;
}

function applyOrder(rows: ReactElement[], order: string[]) {
  const byKey = new Map(rows.map((row) => [String(row.key), row]));
  const ordered: ReactElement[] = [];

  for (const key of order) {
    const row = byKey.get(key);
    if (row) {
      ordered.push(row);
      byKey.delete(key);
    }
  }

  return [...ordered, ...byKey.values()];
}

function slideRow(element: HTMLElement, distance: number, moved: boolean) {
  const classes = moved ? MOVED_ROW_CLASSES : SETTLING_ROW_CLASSES;
  const token = String(performance.now());

  for (const running of element.getAnimations()) {
    running.cancel();
  }

  element.dataset.slide = token;
  element.classList.add(...classes);

  const animation = element.animate(
    [
      { transform: `translateY(${distance}px)` },
      { transform: "translateY(0)" },
    ],
    { duration: SLIDE_MS, easing: SLIDE_EASING },
  );

  // A newer slide on the same row owns the classes from then on.
  const cleanup = () => {
    if (element.dataset.slide === token) {
      element.classList.remove(...classes);
      delete element.dataset.slide;
    }
  };
  animation.addEventListener("finish", cleanup);
  animation.addEventListener("cancel", cleanup);
}

/**
 * `<tbody>` for lists ordered by the user. Pressing an arrow swaps the row with
 * its neighbour right away and slides both into place, while the server action
 * saves the new order. When the action settles, the server's list replaces the
 * local one, so the screen never drifts from what was stored.
 */
export function ReorderableTbody({
  children,
  pageOffset,
  totalCount,
}: {
  children: ReactNode;
  /** Rows on earlier pages: only the very first/last row of the list is fixed. */
  pageOffset: number;
  totalCount: number;
}) {
  const serverRows = collectRows(children);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [isSaving, startSaving] = useTransition();
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const previousTops = useRef(new Map<string, number>());
  const previousKeys = useRef<string[]>([]);
  const movedKey = useRef<string | null>(null);

  const rows = localOrder ? applyOrder(serverRows, localOrder) : serverRows;
  const keys = rows.map((row) => String(row.key));

  useEffect(() => {
    if (!isSaving) {
      setLocalOrder(null);
    }
  }, [isSaving]);

  // FLIP: compare each row's layout position with the previous render and
  // slide it from where it used to be. `offsetTop` ignores running transforms.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const orderChanged = previousKeys.current.join() !== keys.join();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tops = new Map<string, number>();

    keys.forEach((key, index) => {
      const element = body.children[index];
      if (!(element instanceof HTMLElement)) {
        return;
      }

      const top = element.offsetTop;
      const before = previousTops.current.get(key);
      tops.set(key, top);

      if (
        orderChanged &&
        !reduceMotion &&
        before !== undefined &&
        before !== top
      ) {
        slideRow(element, before - top, key === movedKey.current);
      }
    });

    previousTops.current = tops;
    previousKeys.current = keys;
  });

  const context: ReorderContextValue = {
    canMove(id, direction) {
      const index = keys.indexOf(id);
      if (index === -1) {
        return false;
      }

      return direction === "up"
        ? pageOffset + index > 0
        : pageOffset + index < totalCount - 1;
    },
    move(id, direction, action) {
      const index = keys.indexOf(id);
      const target = direction === "up" ? index - 1 : index + 1;

      movedKey.current = id;

      // At a page edge the neighbour is on another page: nothing to swap here.
      if (index !== -1 && target >= 0 && target < keys.length) {
        const next = [...keys];
        [next[index], next[target]] = [next[target], next[index]];
        setLocalOrder(next);
      }

      startSaving(async () => {
        const formData = new FormData();
        formData.set("id", id);
        formData.set("direction", direction);

        try {
          await action(formData);
        } catch (error) {
          // The list falls back to the stored order when saving ends.
          console.error("Não foi possível salvar a nova ordem.", error);
        }
      });
    },
  };

  return (
    <ReorderContext.Provider value={context}>
      <tbody ref={bodyRef}>{rows}</tbody>
    </ReorderContext.Provider>
  );
}
