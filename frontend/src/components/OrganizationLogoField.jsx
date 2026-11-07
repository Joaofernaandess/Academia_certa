import { useEffect, useRef, useState } from 'react';

export default function OrganizationLogoField({ file, existingUrl, error, disabled = false, onChange }) {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(existingUrl || '');

    useEffect(() => {
        if (!file) {
            if (inputRef.current) inputRef.current.value = '';
            setPreviewUrl(existingUrl || '');
            return undefined;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file, existingUrl]);

    const clearSelection = () => {
        if (inputRef.current) inputRef.current.value = '';
        onChange(null);
    };

    return (
        <div className="organization-logo-field">
            <label className="label-sm" htmlFor="organization-logo">Logo da academia</label>
            <p className="organization-logo-help">PNG ou JPG, até 2 MB. Ela aparece no menu do sistema.</p>
            <div className="organization-logo-preview">
                {previewUrl
                    ? <img src={previewUrl} alt="Pré-visualização da logo da academia" />
                    : <span>Pré-visualização da logo</span>}
            </div>
            <div className="organization-logo-controls">
                <input
                    ref={inputRef}
                    id="organization-logo"
                    type="file"
                    accept="image/png,image/jpeg"
                    disabled={disabled}
                    aria-describedby={error ? 'organization-logo-error' : undefined}
                    aria-invalid={Boolean(error)}
                    onChange={event => onChange(event.target.files?.[0] || null)}
                />
                {file && (
                    <button type="button" className="button button-outline" disabled={disabled} onClick={clearSelection}>
                        Descartar seleção
                    </button>
                )}
            </div>
            {error && <small id="organization-logo-error" className="invalid-feedback d-block">{error}</small>}
        </div>
    );
}
