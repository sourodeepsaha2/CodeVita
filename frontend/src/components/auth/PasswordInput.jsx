import { useState } from "react";
import { AlertIcon, EyeIcon, EyeOffIcon } from "../icons";

/**
 * Password input with a show/hide toggle and a Caps Lock warning.
 * Works with react-hook-form: spread `register("password")` onto it.
 */
export default function PasswordInput({ id, className = "", onKeyDown, onKeyUp, onBlur, ...props }) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const capsId = `${id}-caps`;

  const checkCapsLock = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  };

  const describedBy =
    [props["aria-describedby"], capsLock && capsId].filter(Boolean).join(" ") || undefined;

  return (
    <>
      <div className="input-wrap">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className={`input-cv has-trailing ${className}`.trim()}
          aria-describedby={describedBy}
          onKeyDown={(e) => {
            checkCapsLock(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            checkCapsLock(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
        />
        <button
          type="button"
          id={`${id}-toggle`}
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {capsLock && (
        <p id={capsId} className="caps-warning" role="status">
          <AlertIcon />
          Caps Lock is on
        </p>
      )}
    </>
  );
}
