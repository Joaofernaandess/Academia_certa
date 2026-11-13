import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ZeniteIcon from './ZeniteIcon';

export const normalizarRotacao = (rotacao) => ((rotacao % 360) + 360) % 360;

const ehVideoUrl = (url = '') => (
    url.startsWith('data:video/') ||
    url.toLowerCase().endsWith('.mp4') ||
    url.toLowerCase().endsWith('.webm')
);

const processarImagemComCanvas = (src, rotacao = 0, maxWidth = 900, quality = 0.82) => (
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const angulo = normalizarRotacao(rotacao);
            const inverterDimensoes = angulo === 90 || angulo === 270;

            let larguraOriginal = img.width;
            let alturaOriginal = img.height;

            if (larguraOriginal > maxWidth) {
                alturaOriginal = Math.round((alturaOriginal * maxWidth) / larguraOriginal);
                larguraOriginal = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = inverterDimensoes ? alturaOriginal : larguraOriginal;
            canvas.height = inverterDimensoes ? larguraOriginal : alturaOriginal;

            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angulo * Math.PI) / 180);
            ctx.drawImage(img, -larguraOriginal / 2, -alturaOriginal / 2, larguraOriginal, alturaOriginal);

            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = src;
    })
);

const lerArquivoComoDataUrl = (file) => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    })
);

export default function ArquivoUploadArea({
    value = '',
    onChange,
    disabled = false,
    arquivoInputId = 'arquivo-upload-input',
    fotoInputId = 'foto-upload-input',
    aceitarArquivo = 'image/*',
    mensagemVazia = 'Arraste uma imagem aqui ou utilize os botões acima',
    variant = 'wizard',
    headerContent = null,
    error = '',
    onError
}) {
    const arquivoInputRef = useRef(null);
    const fotoInputRef = useRef(null);
    const [nomeArquivo, setNomeArquivo] = useState('Mídia selecionada');
    const [imagemExpandida, setImagemExpandida] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const selecionarArquivo = async (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            if (onError) onError('O arquivo deve ter no máximo 10MB.');
            return;
        }

        try {
            setNomeArquivo(file.name || 'Mídia selecionada');
            const rawDataUrl = await lerArquivoComoDataUrl(file);
            const isGifOrVideo = file.type === 'image/gif' || file.type.startsWith('video/');

            if (isGifOrVideo) {
                onChange(rawDataUrl);
            } else {
                const comprimida = await processarImagemComCanvas(rawDataUrl, 0);
                onChange(comprimida);
            }
        } catch (err) {
            console.error(err);
            if (onError) onError('Não foi possível processar o arquivo selecionado.');
        }
    };

    const limparArquivo = () => {
        onChange('');
        setNomeArquivo('');
        if (arquivoInputRef.current) arquivoInputRef.current.value = '';
        if (fotoInputRef.current) fotoInputRef.current.value = '';
    };

    const girarArquivo = async () => {
        if (!value || ehVideoUrl(value)) return;
        try {
            const rotacionada = await processarImagemComCanvas(value, 90);
            onChange(rotacionada);
        } catch (err) {
            console.error(err);
        }
    };

    const abrirImagemExpandida = (src, nome) => {
        if (!src) return;
        setImagemExpandida({ src, nome: nome || 'Visualização' });
    };

    const fecharImagemExpandida = () => {
        setImagemExpandida(null);
    };

    const handleArquivoChange = (event) => {
        selecionarArquivo(event.target.files?.[0]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        selecionarArquivo(event.dataTransfer.files?.[0]);
    };

    const renderPreview = () => {
        if (ehVideoUrl(value)) {
            return (
                <video
                    className="file-preview-image"
                    src={value}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            );
        }

        return (
            <>
                <img
                    className="file-preview-blur-bg"
                    src={value}
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="file-preview-image file-preview-image-glass"
                    src={value}
                    alt={`Prévia de ${nomeArquivo}`}
                />
            </>
        );
    };

    const isWizard = variant === 'wizard';
    const possuiArquivo = Boolean(value);
    const ehVideo = ehVideoUrl(value);

    const modalImagemExpandida = imagemExpandida && (
        <div className="modal-overlay image-preview-overlay" role="presentation" onClick={fecharImagemExpandida}>
            <div className="card modal-card image-preview-modal" role="dialog" aria-modal="true" aria-label="Imagem ampliada" onClick={event => event.stopPropagation()}>
                <div className="image-preview-modal-header">
                    <h3 className="image-preview-modal-title" title={imagemExpandida.nome}>{imagemExpandida.nome}</h3>
                    <button type="button" className="button-icon-danger" onClick={fecharImagemExpandida} aria-label="Fechar" title="Fechar" data-zf-modal-close>
                        <ZeniteIcon name="x" size={22} />
                    </button>
                </div>
                <div className="image-preview-modal-body image-preview-modal-body-glass">
                    <img
                        className="image-preview-modal-blur-bg"
                        src={imagemExpandida.src}
                        alt=""
                        aria-hidden="true"
                    />
                    <img
                        src={imagemExpandida.src}
                        alt={imagemExpandida.nome}
                        className="image-preview-modal-image file-preview-image-glass"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                className={`row detail-form-fields ${isWizard ? 'wizard-upload-area mb-1 ' : ''}drop-zone ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!possuiArquivo && isWizard && (
                    <div className="column-12 wizard-upload-actions">
                        <label htmlFor={arquivoInputId} className="button button-full wizard-upload-button">
                            <ZeniteIcon name="file-up" size={34} />
                            <span className="button-icon-text">Enviar arquivo</span>
                        </label>
                        <input id={arquivoInputId} ref={arquivoInputRef} type="file" accept={aceitarArquivo} className="d-none" onChange={handleArquivoChange} />
                        <label htmlFor={fotoInputId} className="button button-full wizard-upload-button">
                            <ZeniteIcon name="camera" size={34} />
                            <span className="button-icon-text">Tirar foto</span>
                        </label>
                        <input id={fotoInputId} ref={fotoInputRef} type="file" accept="image/*" capture="environment" className="d-none" onChange={handleArquivoChange} />
                    </div>
                )}

                {!possuiArquivo && !isWizard && (
                    <>
                        <div className="column-6 mb-1">
                            <label htmlFor={arquivoInputId} className="button button-outline button-full">
                                <ZeniteIcon name="file-up" size={34} />
                                <span className="button-icon-text">Enviar arquivo</span>
                            </label>
                            <input id={arquivoInputId} ref={arquivoInputRef} type="file" accept={aceitarArquivo} className="d-none" onChange={handleArquivoChange} />
                        </div>
                        <div className="column-6 mb-1">
                            <label htmlFor={fotoInputId} className="button button-outline button-full">
                                <ZeniteIcon name="camera" size={34} />
                                <span className="button-icon-text">Tirar foto</span>
                            </label>
                            <input id={fotoInputId} ref={fotoInputRef} type="file" accept="image/*" capture="environment" className="d-none" onChange={handleArquivoChange} />
                        </div>
                    </>
                )}

                {!possuiArquivo && (
                    <div className="column-12">
                        <div className={`empty-state-plain ${isWizard ? 'wizard-upload-dropzone' : ''}`}>
                            <div className="empty-state-icon">
                                <ZeniteIcon name={isWizard ? 'image' : 'file-search'} size={isWizard ? 54 : 92} strokeWidth={1.7} />
                            </div>
                            <p className={`empty-state-text ${isWizard ? 'wizard-upload-text' : ''}`}>
                                {isDragging ? 'Solte o arquivo aqui...' : mensagemVazia}
                            </p>
                        </div>
                    </div>
                )}

                {possuiArquivo && (
                    <div className="column-12">
                        <div className="d-flex items-center justify-between mb-0 w-100">
                            <div className="flex-grow-1 d-flex items-center">{headerContent}</div>
                            <div className="button-group no-margin d-flex items-center flex-shrink-0">
                                {!ehVideo && (
                                    <button
                                        type="button"
                                        className="button-icon-accent pedido-upload-rotate pedido-upload-expand"
                                        onClick={() => abrirImagemExpandida(value, nomeArquivo)}
                                        title="Expandir imagem"
                                    >
                                        <ZeniteIcon name="maximize" size={14} />
                                    </button>
                                )}
                                {!ehVideo && (
                                    <button
                                        type="button"
                                        className="button-icon-accent pedido-upload-rotate"
                                        onClick={girarArquivo}
                                        title="Girar arquivo"
                                    >
                                        <ZeniteIcon name="rotate-cw" size={14} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="button-icon-danger"
                                    disabled={disabled}
                                    onClick={limparArquivo}
                                    title="Remover arquivo"
                                >
                                    <ZeniteIcon name="trash" size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="wizard-upload-dropzone pedido-upload-selected wizard-upload-selected mt-1">
                            <div className="file-preview file-preview-glass-wrapper">
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="column-12">
                        <small className="invalid-feedback d-block">{error}</small>
                    </div>
                )}
            </div>

            {modalImagemExpandida && createPortal(modalImagemExpandida, document.body)}
        </>
    );
}