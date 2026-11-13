import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { openFloatingCombobox } from '../styles/js/components/floating-action-menu';
import { getBaseUrl } from '../utils/apiConfig';
import { carregarTodasPaginas } from '../utils/paginatedFetch';
import { formatPhone } from '../utils/phone';

export default function AlunoComboBox({
    token,
    unidadeOrganizacionalId,
    value,
    onChange,
    label = 'Aluno da Ficha de Treino',
    error,
    errorMessage
}) {
    const [alunos, setAlunos] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const comboRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (!unidadeOrganizacionalId || !token) return;
        setLoading(true);

        const buscarPaginaAlunos = (skip) => {
            const query = new URLSearchParams({
                unidadeOrganizacionalId,
                cadastroCompleto: 'true',
                skip: String(skip),
                top: '50'
            });
            return fetch(`${getBaseUrl()}/v1/usuarios?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        };

        carregarTodasPaginas(buscarPaginaAlunos)
            .then(({ ok, itens }) => {
                setAlunos(ok ? itens : []);
            })
            .catch(() => setAlunos([]))
            .finally(() => setLoading(false));
    }, [token, unidadeOrganizacionalId]);

    const alunosSeguros = Array.isArray(alunos) ? alunos : [];

    const filteredAlunos = alunosSeguros.filter(u => {
        const termo = search.toLowerCase();
        const fone = String(u.username || '');
        return (
            u.nome?.toLowerCase().includes(termo) ||
            fone.toLowerCase().includes(termo) ||
            formatPhone(fone).toLowerCase().includes(termo)
        );
    });

    const selected = alunosSeguros.find(u => u.usuarioId === value);
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
    }, [isOpen, filteredAlunos.length]);

    const selecionarAluno = (aluno) => {
        if (onChange) onChange(aluno.usuarioId, aluno);
        setSearch('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const listaOpcoes = (
        <>
            {loading ? (
                <li className="zf-combobox-empty" aria-live="polite">
                    Carregando alunos...
                </li>
            ) : filteredAlunos.length > 0 ? (
                filteredAlunos.map((u, index) => (
                    <li
                        key={u.usuarioId}
                        className={`zf-combobox-item ${highlightedIndex === index ? 'highlighted' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selecionarAluno(u)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <div className="zf-cb-left">
                            <span className="zf-cb-name">{u.nome}</span>
                            <span className="zf-cb-cpf">{formatPhone(u.username)}</span>
                        </div>
                    </li>
                ))
            ) : (
                <li className="zf-combobox-empty" aria-live="polite">
                    {search.trim() ? 'Aluno não encontrado' : 'Nenhum aluno disponível'}
                </li>
            )}
        </>
    );

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else if (filteredAlunos.length === 0) {
                setHighlightedIndex(-1);
            } else {
                setHighlightedIndex(prev => (prev < filteredAlunos.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            }
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredAlunos.length) {
                e.preventDefault();
                selecionarAluno(filteredAlunos[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    };

    return (
        <div className="mb-1">
            <label className="label-sm">{label}</label>
            <div ref={comboRef} className={`zf-combobox zf-combobox-custom-arrow combobox-field ${isOpen ? 'active' : ''}`}>
                <input
                    type="text"
                    placeholder="Pesquisar aluno por nome ou telefone..."
                    value={displayValue}
                    onClick={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                        setHighlightedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className={`zf-combobox-input combobox-input ${error ? 'is-invalid' : ''}`}
                />
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
            {error && <small className="invalid-feedback d-block">{errorMessage}</small>}
        </div>
    );
}