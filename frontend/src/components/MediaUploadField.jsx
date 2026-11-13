import { useRef, useState } from 'react';
import ZeniteIcon from './ZeniteIcon';

const MAX_FILE_SIZE_MB = 8;

const comprimirImagem = (file, maxWidth = 900, quality = 0.8) => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    })
);

const lerArquivoDireto = (file) => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    })
);

export default function MediaUploadField({
    label = 'Foto ou Mídia',
    value,
    onChange,
    accept = 'image/*',
    allowVideo = false,
    onError
}) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [processando, setProcessando] = useState(false);

    const isVideoContent = (url) => {
        if (!url) return false;
        return url.startsWith('data:video/') || url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
    };

    const processarArquivo = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            if (onError) onError(`O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setProcessando(true);
        try {
            const isGifOrVideo = file.type === 'image/gif' || file.type.startsWith('video/');
            const dataUrl = isGifOrVideo
                ? await lerArquivoDireto(file)
                : await comprimirImagem(file);

            onChange(dataUrl);
        } catch (err) {
            console.error(err);
            if (onError) onError('Não foi possível processar o arquivo selecionado.');
        } finally {
            setProcessando(false);
        }
    };

    return (
        <div className="academia-upload-wrapper">
            <label className="label-sm">{label}</label>

            <input
                ref={fileInputRef}
                type="file"
                accept={allowVideo ? 'image/*,video/mp4,video/webm' : accept}
                onChange={processarArquivo}
                className="d-none"
            />

            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={processarArquivo}
                className="d-none"
            />

            {value ? (
                <div className="academia-upload-preview-card">
                    <div className="file-preview academia-upload-preview-box">
                        {isVideoContent(value) ? (
                            <video
                                src={value}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="file-preview-image"
                            />
                        ) : (
                            <img
                                src={value}
                                alt="Pré-visualização"
                                className="file-preview-image"
                            />
                        )}
                    </div>

                    <div className="academia-upload-actions-row">
                        <button
                            type="button"
                            className="button button-outline academia-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processando}
                        >
                            Trocar Arquivo
                        </button>
                        <button
                            type="button"
                            className="button-icon-danger"
                            onClick={() => onChange('')}
                            aria-label="Remover mídia"
                            title="Remover mídia"
                        >
                            <ZeniteIcon name="trash" size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="wizard-upload-dropzone academia-upload-dropzone">
                    <p className="empty-state-text mb-1">
                        {processando
                            ? 'Processando arquivo...'
                            : 'Selecione uma imagem da galeria ou tire uma foto agora'}
                    </p>
                    <div className="academia-upload-buttons">
                        <button
                            type="button"
                            className="button button-outline academia-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processando}
                        >
                            <ZeniteIcon name="plus" size={18} />
                            <span className="button-icon-text">Galeria / Arquivo</span>
                        </button>

                        <button
                            type="button"
                            className="button academia-upload-btn"
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={processando}
                        >
                            <ZeniteIcon name="plus" size={18} />
                            <span className="button-icon-text">Tirar Foto</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}