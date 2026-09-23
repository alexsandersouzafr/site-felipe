"use client";

import { TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/lib/media-limits";
import { cn } from "@/lib/utils";

/**
 * Choosing and removing an image, as two buttons. The file input still carries
 * the file into the form, but it is hidden and opened by the button — which is
 * what lets us warn first, since saving over an image deletes the old file.
 */
export function FilePickerButton({
  id,
  name,
  required,
  disabled = false,
  fileName,
  hasImage = false,
  onChange,
  onRemove,
  className,
  accept = ALLOWED_IMAGE_MIME_TYPES.join(","),
}: {
  id: string;
  name: string;
  required?: boolean;
  /** Keeps the input out of the form data while its section is collapsed. */
  disabled?: boolean;
  /** The chosen file, when there is one. */
  fileName?: string | null;
  /** Whether an image is already saved, which is what makes the warning due. */
  hasImage?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Omit to hide the remove button. */
  onRemove?: () => void;
  className?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [warning, setWarning] = useState(false);

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        disabled={disabled}
        onChange={onChange}
        // The buttons are the control now; the input is only the carrier, so
        // it stays out of the tab order.
        tabIndex={-1}
        className="sr-only"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          isDisabled={disabled}
          onPress={() => (hasImage ? setWarning(true) : openPicker())}
        >
          <UploadSimpleIcon className="size-3.5" data-icon="inline-start" />
          {hasImage || fileName ? "Trocar imagem" : "Escolher imagem"}
        </Button>

        {onRemove && hasImage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            isDisabled={disabled}
            onPress={() => {
              // The input may already hold a replacement; leaving it there
              // would save the very image the person just asked to drop.
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              onRemove();
            }}
          >
            <TrashIcon className="size-3.5" data-icon="inline-start" />
            Remover imagem
          </Button>
        ) : null}

        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {fileName ??
            (hasImage ? "Mantém a imagem atual" : "Nenhum arquivo escolhido")}
        </span>
      </div>

      <Dialog isOpen={warning} onOpenChange={setWarning}>
        <DialogHeader>
          <DialogTitle>Trocar a imagem?</DialogTitle>
          <DialogDescription>
            Subir uma nova imagem apaga a imagem anterior. Isso é irreversível.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onPress={() => setWarning(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onPress={() => {
              setWarning(false);
              openPicker();
            }}
          >
            <UploadSimpleIcon className="size-4" data-icon="inline-start" />
            Escolher imagem
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
