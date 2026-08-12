"use client";

import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";
import { Dialog } from "react-aria-components";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  formatDateTimeBr,
  formatDateTimeLocal,
  formatMonthCaption,
  formatWeekdayLabel,
  parseDateTimeLocal,
} from "@/lib/datetime-br";
import { cn } from "@/lib/utils";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => minute);

function buildMonthGrid(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

function weekdayHeaders(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({
    start,
    end: endOfWeek(start, { weekStartsOn: 0 }),
  });
}

export function DateTimePickerField({
  id,
  name,
  defaultValue = "",
  required = false,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initial = parseDateTimeLocal(defaultValue);
  const [selected, setSelected] = useState<Date | null>(initial);
  const [month, setMonth] = useState<Date>(initial ?? new Date());

  const days = useMemo(() => buildMonthGrid(month), [month]);
  const headers = useMemo(() => weekdayHeaders(month), [month]);
  const value = selected ? formatDateTimeLocal(selected) : "";
  const label = selected ? formatDateTimeBr(selected) : "Selecione data e hora";

  function selectDay(day: Date) {
    setSelected((current) => {
      const base = current ?? new Date();
      return setMinutes(
        setHours(startOfDay(day), base.getHours()),
        base.getMinutes(),
      );
    });
  }

  function setTimePart(part: "hours" | "minutes", raw: string) {
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      return;
    }

    setSelected((current) => {
      const base = current ?? new Date();
      return part === "hours"
        ? setHours(base, numeric)
        : setMinutes(base, numeric);
    });
  }

  const hours = selected?.getHours() ?? 0;
  const minutes = selected?.getMinutes() ?? 0;

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        id={id}
        name={name}
        value={value}
        required={required}
      />
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-full justify-start font-normal"
        >
          <CalendarBlankIcon className="size-4" data-icon="inline-start" />
          <span className={cn(!selected && "text-muted-foreground")}>
            {label}
          </span>
        </Button>
        <Popover
          className="w-[min(20rem,calc(100vw-2rem))]"
          placement="bottom start"
        >
          <Dialog className="outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Mês anterior"
                  onPress={() => setMonth((current) => addMonths(current, -1))}
                >
                  <CaretLeftIcon className="size-4" />
                </Button>
                <p className="text-sm font-medium capitalize">
                  {formatMonthCaption(month)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Próximo mês"
                  onPress={() => setMonth((current) => addMonths(current, 1))}
                >
                  <CaretRightIcon className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {headers.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="text-xs font-medium text-muted-foreground capitalize"
                  >
                    {formatWeekdayLabel(day)}
                  </div>
                ))}
                {days.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isSelected = selected
                    ? isSameDay(day, selected)
                    : false;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={cn(
                        "flex size-8 cursor-pointer items-center justify-center rounded-xl text-sm transition-colors",
                        !inMonth && "text-muted-foreground/50",
                        inMonth && !isSelected && "hover:bg-muted",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border/80 pt-3">
                <label className="space-y-1.5 text-xs text-muted-foreground">
                  Hora
                  <select
                    className="flex h-8 w-full cursor-pointer rounded-2xl border border-input bg-transparent px-2 text-sm text-foreground outline-none"
                    value={hours}
                    onChange={(event) =>
                      setTimePart("hours", event.target.value)
                    }
                  >
                    {HOUR_OPTIONS.map((hour) => (
                      <option key={`hour-${hour}`} value={hour}>
                        {String(hour).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs text-muted-foreground">
                  Minuto
                  <select
                    className="flex h-8 w-full cursor-pointer rounded-2xl border border-input bg-transparent px-2 text-sm text-foreground outline-none"
                    value={minutes}
                    onChange={(event) =>
                      setTimePart("minutes", event.target.value)
                    }
                  >
                    {MINUTE_OPTIONS.map((minute) => (
                      <option key={`minute-${minute}`} value={minute}>
                        {String(minute).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </Dialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}
