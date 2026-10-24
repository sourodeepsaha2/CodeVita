import { AlertIcon } from "../icons";

/**
 * Label + input + error/hint, with the accessibility wiring done for you.
 *
 * `children` is a render function that receives the props the input needs:
 *   <FormField id="email" label="Email" error={errors.email?.message}>
 *     {(field) => <input {...field} {...register("email")} />}
 *   </FormField>
 */
export default function FormField({ id, label, error, hint, labelAction, className = "", children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const showHint = Boolean(hint) && !error;
  const describedBy = [error && errorId, showHint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field ${className}`.trim()}>
      <div className="field-label-row">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {labelAction}
      </div>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}

      {showHint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}
