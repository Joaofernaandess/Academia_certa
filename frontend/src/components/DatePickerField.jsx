import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const mesesCalendario = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const diasSemanaCalendario = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const criarDataLocal = (valor) => {
    if (!valor) return new Date();
    const [ano, mes, dia] = String(valor).split('-').map(Number);
    if (!ano || !mes || !dia) return new Date();
    return new Date(ano, mes - 1, dia);
};

const criarValorData = (ano, mes, dia) => (
    `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
);

export default function DatePickerField({ value, onChange, disabled = false, error, errorMessage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarioMes, setCalendarioMes] = useState(() => new Date());
    const [posicao, setPosicao] = useState(null);
    const [displayValue, setDisplayValue] = useState('');
    const triggerRef = useRef(null);

    useEffect(() => {
        if (value && value.includes('-')) {
            const [ano, mes, dia] = value.split('-');
            setDisplayValue(`${dia}/${mes}/${ano}`);
        } else if (!value) {
            setDisplayValue('');
        }
    }, [value]);

    const handleInputChange = (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        
        let formatted = v;
        if (v.length > 4) {
            formatted = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
        } else if (v.length > 2) {
            formatted = `${v.slice(0, 2)}/${v.slice(2)}`;
        }
        
        setDisplayValue(formatted);

        if (formatted.length === 10) {
            const [dia, mes, ano] = formatted.split('/');
            if (onChange) onChange(`${ano}-${mes}-${dia}`);
        } else if (formatted.length === 0) {
            if (onChange) onChange('');
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setPosicao(null);
            return undefined;
        }

        const atualizarPosicao = () => {
            const elemento = triggerRef.current;
            if (!elemento) return;

            const rect = elemento.getBoundingClientRect();
            const margin = 12;
            const espacoAbaixo = window.innerHeight - rect.bottom - margin;
            const espacoAcima = rect.top - margin;
            
            const alturaCalendario = 320;
            const abrirAcima = espacoAbaixo < alturaCalendario && espacoAcima > espacoAbaixo;
            
            const alturaMaxima = Math.max(260, Math.min(alturaCalendario, abrirAcima ? espacoAcima : espacoAbaixo));

            setPosicao({
                top: abrirAcima ? rect.top + window.scrollY - margin : rect.bottom + window.scrollY + margin,
                left: rect.left + window.scrollX,
                width: rect.width,
                maxHeight: alturaMaxima,
                placement: abrirAcima ? 'top' : 'bottom'
            });
        };

        atualizarPosicao();
        window.addEventListener('resize', atualizarPosicao);
        window.addEventListener('scroll', atualizarPosicao, true);
        window.visualViewport?.addEventListener('resize', atualizarPosicao);
        window.visualViewport?.addEventListener('scroll', atualizarPosicao);

        return () => {
            window.removeEventListener('resize', atualizarPosicao);
            window.removeEventListener('scroll', atualizarPosicao, true);
            window.visualViewport?.removeEventListener('resize', atualizarPosicao);
            window.visualViewport?.removeEventListener('scroll', atualizarPosicao);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const fecharCalendario = (event) => {
            const campo = triggerRef.current;
            const popover = document.querySelector('.date-picker-popover');
            if (campo?.contains(event.target) || popover?.contains(event.target)) return;
            setIsOpen(false);
        };

        document.addEventListener('mousedown', fecharCalendario);
        return () => document.removeEventListener('mousedown', fecharCalendario);
    }, [isOpen]);

    const handleAbrir = () => {
        if (disabled) return;
        const dataAtual = criarDataLocal(value);
        setCalendarioMes(new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1));
        setIsOpen(true);
    };

    const alterarMes = (direcao) => {
        setCalendarioMes(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
    };

    const selecionarData = (dia) => {
        if (!isOpen || !onChange) return;
        onChange(criarValorData(calendarioMes.getFullYear(), calendarioMes.getMonth(), dia));
        setIsOpen(false);
    };

    const primeiroDiaMes = new Date(calendarioMes.getFullYear(), calendarioMes.getMonth(), 1).getDay();
    const totalDiasMes = new Date(calendarioMes.getFullYear(), calendarioMes.getMonth() + 1, 0).getDate();
    const hoje = criarValorData(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    return (
        <div>
            <div className="zf-input-with-action" ref={triggerRef}>
                <input
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleInputChange}
                    disabled={disabled}
                    placeholder="DD/MM/AAAA"
                    className={`w-full no-field-margin ${disabled ? 'input-readonly' : ''} ${error ? 'is-invalid' : ''}`}
                    style={{
                        color: 'var(--color-text)',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: disabled ? 'not-allowed' : 'text'
                    }}
                />
                
                <button
                    type="button"
                    className="button zf-input-with-action__button"
                    onClick={handleAbrir}
                    disabled={disabled}
                    title={disabled ? "Campo bloqueado" : "Abrir calendário"}
                    style={{
                        padding: '0 12px',
                        background: disabled ? 'transparent' : '',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </button>
            </div>
            
            {error && <small className="invalid-feedback d-block">{errorMessage}</small>}

            {isOpen && posicao && createPortal(
                <div
                    className="date-picker-popover"
                    style={{
                        top: `${posicao.top}px`,
                        left: `${posicao.left}px`,
                        width: `${Math.max(posicao.width, 320)}px`,
                        maxHeight: `${posicao.maxHeight}px`,
                        transform: posicao.placement === 'top' ? 'translateY(-100%)' : 'none',
                        zIndex: 99999 // <-- A mágica acontece aqui: zIndex altíssimo para sobrepor a modal
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                >
                    <div className="calendar date-picker-calendar">
                        <div className="calendar-header">
                            <button type="button" className="calendar-btn" onClick={() => alterarMes(-1)}>
                                {'<'}
                            </button>
                            <h3>{mesesCalendario[calendarioMes.getMonth()]} {calendarioMes.getFullYear()}</h3>
                            <button type="button" className="calendar-btn" onClick={() => alterarMes(1)}>
                                {'>'}
                            </button>
                        </div>

                        <div className="calendar-grid">
                            {diasSemanaCalendario.map(diaSemana => (
                                <span key={diaSemana} className="calendar-day-name">{diaSemana}</span>
                            ))}

                            {Array.from({ length: primeiroDiaMes }).map((_, index) => (
                                <span key={`empty-start-${index}`} className="calendar-day empty"></span>
                            ))}

                            {Array.from({ length: totalDiasMes }).map((_, index) => {
                                const dia = index + 1;
                                const valorDia = criarValorData(calendarioMes.getFullYear(), calendarioMes.getMonth(), dia);
                                const ativo = value === valorDia;
                                
                                return (
                                    <button
                                        key={valorDia}
                                        type="button"
                                        className={[
                                            'calendar-day',
                                            ativo ? 'active' : '',
                                            valorDia === hoje ? 'today' : ''
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => selecionarData(dia)}
                                    >
                                        {dia}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}