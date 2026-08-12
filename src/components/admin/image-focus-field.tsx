import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { DEFAULT_IMAGE_FOCUS, IMAGE_FOCUS_OPTIONS } from "@/lib/image-focus";

export function ImageFocusField({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Enquadramento</FieldLabel>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue || DEFAULT_IMAGE_FOCUS}
        className="flex h-9 w-full cursor-pointer rounded-2xl border border-input bg-transparent px-3 text-sm text-foreground outline-none"
      >
        {IMAGE_FOCUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldDescription>
        Define qual parte da foto permanece visível quando ela preenche a faixa
        (útil para retratos).
      </FieldDescription>
    </Field>
  );
}
