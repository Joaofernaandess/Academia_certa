import { formatPhone } from '../utils/phone';

export default function PhoneInput({ value, onChange, label = 'Login', error, errorMessage }) {
    const handleChange = (e) => {
        const input = e.target;
        const cursorPosition = input.selectionStart;
        const currentLength = input.value.length;

        let rawValue = input.value.replace(/\D/g, '');
        if (rawValue.length > 12) {
            rawValue = rawValue.slice(0, 12);
        }

        onChange({ target: { value: rawValue } });

        if (cursorPosition < currentLength) {
            setTimeout(() => {
                if (input) input.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        }
    };

    return (
        <div className="mb-1">
            <label>
                {label}
            </label>
            <input
                type="tel"
                placeholder="(99) 99999-9999"
                value={formatPhone(value)}
                onChange={handleChange}
                className={`w-full no-field-margin ${error ? 'is-invalid' : ''}`}
            />
            {error && <small className="invalid-feedback d-block">{errorMessage}</small>}
        </div>
    );
}
