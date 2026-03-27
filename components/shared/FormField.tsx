"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="form-field">
        <label htmlFor={fieldId} className="form-field__label">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          aria-invalid={!!error}
          className={`form-field__input ${error ? "form-field__input--error" : ""} ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="form-field__hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-error`} role="alert" className="form-field__error">
            <span aria-hidden="true">↑</span> {error}
          </p>
        )}

        <style jsx>{`
          .form-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-field__label {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.8125rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #6b7280;
          }
          .form-field__input {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.9375rem;
            color: #111827;
            background: #ffffff;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            padding: 11px 14px;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            width: 100%;
            box-sizing: border-box;
          }
          .form-field__input:focus {
            border-color: #1a1a2e;
            box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.08);
          }
          .form-field__input--error {
            border-color: #ef4444;
          }
          .form-field__input--error:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          .form-field__hint {
            font-size: 0.8125rem;
            color: #9ca3af;
            margin: 0;
          }
          .form-field__error {
            font-size: 0.8125rem;
            color: #ef4444;
            margin: 0;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }
);

FormField.displayName = "FormField";
export default FormField;
