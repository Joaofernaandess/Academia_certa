export default function MessageModal({
    type,
    title,
    message,
    onClose,
    buttonLabel,
    autoClose = 8000,
    autoCloseMs,
}) {
    const normalizedType = type === 'danger' ? 'error' : type;
    const isError = normalizedType === 'error';
    const messageType = normalizedType === 'warning' ? 'warning' : (isError ? 'error' : 'success');
    const closeDelay = autoCloseMs ?? autoClose;
    const isStandardDelay = closeDelay === 8000;
    const modalTitle = title || '';
    const actionLabel = buttonLabel || (isError ? 'Fechar' : 'OK');

    if (!message) return null;

    return (
        <div className="message-overlay message-overlay-dim">
            <div className="card message-card">
                {modalTitle && (
                    <h2 className={`message-title-${messageType}`}>
                        {modalTitle}
                    </h2>
                )}

                <p className="message-text">
                    {message}
                </p>

                <div
                    className={`message-progress message-progress-${messageType}`}
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-hidden="true"
                >
                    <span
                        key={`${type}-${message}`}
                        className={`message-progress-bar ${isStandardDelay ? 'message-progress-bar-standard' : ''}`}
                        onAnimationEnd={onClose}
                    />
                </div>

                <button
                    type="button"
                    className={`button button-full button-outline-${messageType}`}
                    onClick={onClose}
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}