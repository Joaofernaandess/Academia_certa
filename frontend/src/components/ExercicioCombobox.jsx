import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { listarExercicios } from '../services/exercicioService';
import { openFloatingCombobox } from '../styles/js/components/floating-action-menu';
import { carregarTodasPaginas } from '../utils/paginatedFetch';

export default function ExercicioComboBox({
    token,
    unidadeOrganizacionalId,
    onSelect,
    error,
    errorMessage,
    action
}) {
    const [exercicios, setExercicios] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const comboRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (!unidadeOrganizacionalId) return;
        setLoading(true);
        carregarTodasPaginas((skip) => listarExercicios({ token, unidadeOrganizacionalId, skip }))
            .then(({ ok, itens }) => {
                setExercicios(ok ? itens : []);
            })
            .catch(() => setExercicios([]))
            .finally(() => setLoading(false));
    }, [token, unidadeOrganizacionalId]);

    const exerciciosSeguros = Array.isArray(exercicios) ? exercicios : [];

    const filteredExercicios = exerciciosSeguros.filter(ex => {
        const termo = search.toLowerCase();
        return (
            ex.nome?.toLowerCase().includes(termo) ||
            ex.descricao?.toLowerCase().includes(termo)
        );
    });

    const handleSelectExercicio = (exercicio) => {
        if (onSelect) onSelect(exercicio);
        setSearch('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

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
    }, [isOpen, filteredExercicios.length]);

    const listaOpcoes = (
        <>
            {loading ? (
                <li className="zf-combobox-empty" aria-live="polite">
                    Carregando opções...
                </li>
            ) : filteredExercicios.length > 0 ? (
                filteredExercicios.map((ex, index) => (
                    <li
                        key={ex.exercicioId}
                        className={`zf-combobox-item ${highlightedIndex === index ? 'highlighted' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectExercicio(ex)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <div className="zf-cb-left">
                            <span className="zf-cb-name">{ex.nome}</span>
                            {ex.descricao && <span className="zf-cb-cpf">{ex.descricao}</span>}
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
            } else if (filteredExercicios.length === 0) {
                setHighlightedIndex(-1);
            } else {
                setHighlightedIndex(prev => (prev < filteredExercicios.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            }
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredExercicios.length) {
                e.preventDefault();
                handleSelectExercicio(filteredExercicios[highlightedIndex]);
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
                value={search}
                onClick={() => setIsOpen(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className={`zf-combobox-input combobox-input ${search ? 'has-clear-button' : ''} ${error ? 'is-invalid' : ''}`}
            />
            {search && (
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
            <label>Adicionar Exercício à Ficha</label>
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