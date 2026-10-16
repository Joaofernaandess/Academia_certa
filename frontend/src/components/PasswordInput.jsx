import { useState } from 'react';

export default function PasswordInput({ label = "Senha", value, onChange, placeholder = "Senha", error, errorMessage }) {
    const [show, setShow] = useState(false);

    return (
        <div className="mb-1">
            <label>
                {label}
            </label>
            <div className="password-field">
                <input
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`password-input no-field-margin ${error ? 'is-invalid' : ''}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="password-toggle"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={-1}
                >
                    {show ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    )}
                </button>
            </div>
            {error && <small className="invalid-feedback d-block">{errorMessage}</small>}
        </div>
    );
}
