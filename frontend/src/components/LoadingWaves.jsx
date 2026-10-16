export default function LoadingWaves({ variant = 'list', rows = 3, label = 'Carregando conteúdo', className = '' }) {
    const lines = Array.from({ length: rows });

    return (
        <div className={`loading-waves loading-waves-${variant} ${className}`.trim()} role="status" aria-label={label}>
            {lines.map((_, index) => (
                <div className="loading-wave-card" key={index}>
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-text short" />
                    {variant === 'cards' && <div className="skeleton skeleton-button" />}
                </div>
            ))}
        </div>
    );
}