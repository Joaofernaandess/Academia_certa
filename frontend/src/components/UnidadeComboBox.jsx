import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { listarUnidadesOrganizacionais } from '../services/unidadeOrganizacionalService';
import { formatCnpj } from '../utils/cnpj';
import { carregarTodasPaginas } from '../utils/paginatedFetch';

export default function UnidadeComboBox({ value, onChange, error, errorMessage, action }) {
    const [unidades, setUnidades] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [listPosition, setListPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    const comboRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        carregarTodasPaginas((skip) => listarUnidadesOrganizacionais({ skip, aprovado: true }))
            .then(({ ok, itens }) => {
                setUnidades(ok ? itens : []);
            })
            .catch(() => setUnidades([]))
            .finally(() => setLoading(false));
    }, []);

    const unidadesSeguras = Array.isArray(unidades) ? unidades : [];

    const getNomeExibicao = (u) => {
        if (!u) return '';
        return u.nomeFantasia || u.razaoSocial || 'Unidade sem nome';
    };

    const filteredUnidades = unidadesSeguras.filter(u => {
        const termo = search.toLowerCase();
        const cnpj = String(u.cnpj || '');
        return (
            getNomeExibicao(u).toLowerCase().includes(termo) ||
            cnpj.toLowerCase().includes(termo) ||
            formatCnpj(cnpj).toLowerCase().includes(termo)
        );
    });

    const selected = unidadesSeguras.find(u => u.unidadeOrganizacionalId === value);
    const displayValue = isOpen ? search : getNomeExibicao(selected);

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const itemElement = listRef.current.children[highlightedIndex];
            if (itemElement) {
                itemElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        if (!isOpen || !comboRef.current) {
            setListPosition(null);
            return;
        }
        const updateListPosition = () => {
            if (!comboRef.current) return;
            const rect = comboRef.current.getBoundingClientRect();
            const visualViewport = window.visualViewport;
            const viewportGap = 12;
            const viewportBottom = visualViewport
                ? visualViewport.offsetTop + visualViewport.height
                : window.innerHeight;
            const availableHeight = Math.max(120, viewportBottom - rect.bottom - viewportGap);

            setListPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
                width: rect.width,
                maxHeight: Math.min(250, availableHeight)
            });
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
    }, [isOpen, filteredUnidades.length]);

    const listaOpcoes = (
        <>
            {loading ? (
                <li className="zf-combobox-empty" aria-live="polite">
                    Carregando opções...
                </li>
            ) : filteredUnidades.length > 0 ? (
                filteredUnidades.map((u, index) => (
                    <li
                        key={u.unidadeOrganizacionalId}
                        className={`zf-combobox-item ${highlightedIndex === index ? 'highlighted' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            onChange(u.unidadeOrganizacionalId);
                            setSearch('');
                            setIsOpen(false);
                            setHighlightedIndex(-1);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <div className="zf-cb-left">
                            <span className="zf-cb-name">{getNomeExibicao(u)}</span>
                            <span className="zf-cb-cpf">{formatCnpj(u.cnpj)}</span>
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
            } else if (filteredUnidades.length === 0) {
                setHighlightedIndex(-1);
            } else {
                setHighlightedIndex(prev => (prev < filteredUnidades.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            }
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredUnidades.length) {
                e.preventDefault();
                const selectedU = filteredUnidades[highlightedIndex];
                onChange(selectedU.unidadeOrganizacionalId);
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
                </div>
            )}
            {isOpen && listPosition && createPortal(
                <ul
                    className="zf-combobox-list zf-combobox-list-floating is-open"
                    ref={listRef}
                    style={{
                        top: `${listPosition.top}px`,
                        left: `${listPosition.left}px`,
                        width: `${listPosition.width}px`,
                        maxHeight: `${listPosition.maxHeight}px`
                    }}
                >
                    {listaOpcoes}
                </ul>,
                document.body
            )}
        </div>
    );

    return (
        <div className="mb-1">
            <label>
                Unidade Organizacional
            </label>
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