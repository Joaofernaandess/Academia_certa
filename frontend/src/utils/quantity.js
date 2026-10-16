export function maskQuantityInput(value) {
    const clean = String(value ?? '').replace(/[^\d,.]/g, '');

    if (clean.includes(',')) {
        const [integerPart, ...decimalParts] = clean.split(',');
        const integer = integerPart.replace(/\./g, '');
        const decimal = decimalParts.join('').replace(/[,.]/g, '').slice(0, 3);

        return `${integer},${decimal}`;
    }

    const dotParts = clean.split('.');
    if (dotParts.length > 1) {
        const decimal = dotParts.pop().slice(0, 3);
        const integer = dotParts.join('');

        return `${integer},${decimal}`;
    }

    return clean;
}

export function maskQuantityInputFixed3(value) {
    const digits = String(value ?? '').replace(/\D/g, '');
    const padded = digits.padStart(4, '0');
    const integerPart = padded.slice(0, -3).replace(/^0+(?=\d)/, '') || '0';
    const decimalPart = padded.slice(-3);

    return `${integerPart},${decimalPart}`;
}

export function keepMaskedValueCursorAtEnd(event) {
    const input = event?.currentTarget;
    if (!input || typeof input.setSelectionRange !== 'function') return;

    const moveCursorToEnd = () => {
        if (!input.isConnected) return;

        const end = input.value.length;
        if (input.selectionStart !== end || input.selectionEnd !== end) {
            input.setSelectionRange(end, end);
        }
    };

    moveCursorToEnd();
    requestAnimationFrame(moveCursorToEnd);
    setTimeout(moveCursorToEnd, 50);
    setTimeout(moveCursorToEnd, 150);
}

export function preventMaskedValueContextMenu(event) {
    event.preventDefault();
    keepMaskedValueCursorAtEnd(event);
}

export function parseQuantity(value) {
    if (typeof value === 'number') return value;
    const normalized = String(value ?? '')
        .replace(/\./g, '')
        .replace(',', '.');

    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatQuantity(value) {
    const parsed = typeof value === 'number' ? value : parseQuantity(value);

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    }).format(Number.isFinite(parsed) ? parsed : 0);
}

export function formatQuantityMasked(value) {
    const parsed = typeof value === 'number' ? value : parseQuantity(value);

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(Number.isFinite(parsed) ? parsed : 0);
}

export function formatQuantityInput(value) {
    const parsed = typeof value === 'number' ? value : parseQuantity(value);
    if (!Number.isFinite(parsed)) return '';

    return String(Math.round(parsed * 1000) / 1000).replace('.', ',');
}