import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { openFloatingCombobox } from '../styles/js/components/floating-action-menu';

export default function EquipamentoComboBox({
    equipamentos = [],
    value,
    onChange,
    loading = false,
    error,
    errorMessage,
    action
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const comboRef = useRef(null);
    const listRef = useRef(null);

    const equipamentosSeguros = Array.isArray(equipamentos) ? equipamentos : [];

    const filteredEquipamentos = equipamentosSeguros.filter(eq => {
        const termo = search.toLowerCase();
        return (
            eq.nome?.toLowerCase().includes(termo) ||
            eq.grupoMuscular?.toLowerCase().includes(termo)
        );
    });

    const selected = equipamentosSeguros.find(eq => eq.equipamentoId === value);
    const displayValue = isOpen ? search : (selected?.nome || '');

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const itemElement = listRef.current.children[highlightedIndex];
            if (itemElement) {
                itemElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        if (!isOpen || !comboRef.current) return undefined;

        const updateListPosition = () => {
            if (!comboRef.current) return;
            openFloatingCombobox(comboRef.current);
        };

        updateListPosition();
        window.addEventListener('resize', updateListPosition);
        window.addEventListener('scroll', updateListPosition, true);
        window.visualViewport?.addEventListener('resize', updateListPosition);
        window.visualViewport?.addEventListener('scroll', updateListPosition);

        return () => {
            window.removeEventListener('resize', updateListPosition);
            window.removeEventListener('scroll', updateListPosition, true);
            window.visualViewport?.removeEventListener('resize', updateListPosition);
            window.visualViewport?.removeEventListener('scroll', updateListPosition);
        };
    }, [isOpen, filteredEquipamentos.length]);

    const listaOpcoes = (
        <>
            {loading ? (
                <li className="zf-combobox-empty" aria-live="polite">
                    Carregando opções...
                </li>
            ) : filteredEquipamentos.length > 0 ? (
                filteredEquipamentos.map((eq, index) => (
                    <li
                        key={eq.equipamentoId}
                        className={`zf-combobox-item ${highlightedIndex === index ? 'highlighted' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            onChange(eq.equipamentoId);
                            setSearch('');
                            setIsOpen(false);
                            setHighlightedIndex(-1);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <div className="zf-cb-left">
                            <span className="zf-cb-name">{eq.nome}</span>
                            <span className="zf-cb-cpf">{eq.grupoMuscular || 'Geral'}</span>
                        </div>
                    </li>
                ))
            ) : (
                <li className="zf-combobox-empty" aria-live="polite">
                    {search.trim() ? 'Não encontrado' : 'Nenhuma opção disponível'}
                </li>
            )}
        </>
    );

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else if (filteredEquipamentos.length === 0) {
                setHighlightedIndex(-1);
            } else {
                setHighlightedIndex(prev => (prev < filteredEquipamentos.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            }
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredEquipamentos.length) {
                e.preventDefault();
                const selectedEq = filteredEquipamentos[highlightedIndex];
                onChange(selectedEq.equipamentoId);
                setSearch('');
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    };

    const combo = (
        <div ref={comboRef} className={`zf-combobox zf-combobox-custom-arrow combobox-field ${isOpen ? 'active' : ''}`}>
            <input
                type="text"
                placeholder="Pesquisar..."
                value={displayValue}
                onClick={() => setIsOpen(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className={`zf-combobox-input combobox-input ${value ? 'has-clear-button' : ''} ${error ? 'is-invalid' : ''}`}
            />
            {value && (
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange('');
                        setSearch('');
                        setIsOpen(false);
                    }}
                    className="combobox-clear-button"
                >
                    ✕
                </div>
            )}
            {isOpen && createPortal(
                <ul
                    className="zf-combobox-list zf-combobox-list-portal is-open"
                    ref={listRef}
                >
                    {listaOpcoes}
                </ul>,
                document.body
            )}
        </div>
    );

    return (
        <div className="mb-1">
            <label>Selecione o Equipamento</label>
            {action ? (
                <div className="zf-input-with-action">
                    {combo}
                    {action}
                </div>
            ) : combo}
            {error && <small className="invalid-feedback d-block">{errorMessage}</small>}
        </div>
    );
}