import { useState, useEffect, useRef, useCallback } from 'react';

export default function useCombobox(direction = 'down') {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [listPos, setListPos] = useState(null);

    const comboRef = useRef(null);
    const listRef = useRef(null);

    // A MÁGICA DO TECLADO: Abre a lista, mas tira o foco no 1º clique (derrubando o teclado)
    const handleSmartClick = useCallback((e) => {
        if (!isOpen) {
            setIsOpen(true);
            if (e.target && e.target.blur) {
                e.target.blur();
            }
        }
    }, [isOpen]);

    // Fecha a lista se clicar em qualquer lugar fora dela
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInside =
                (comboRef.current && comboRef.current.contains(e.target)) ||
                (listRef.current && listRef.current.contains(e.target));

            if (isOpen && !isInside) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, [isOpen]);

    // Calcula a posição do portal
    useEffect(() => {
        if (!isOpen || !comboRef.current) {
            setListPos(null);
            return;
        }
        const updatePos = () => {
            const rect = comboRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            if (direction === 'up') {
                setListPos({
                    bottom: document.documentElement.scrollHeight - (rect.top + scrollTop) + 5,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxHeight: 220
                });
            } else {
                setListPos({
                    top: rect.bottom + 5,
                    left: rect.left,
                    width: rect.width,
                    maxHeight: 180
                });
            }
        };

        updatePos();
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos, true);
        return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos, true);
        };
    }, [isOpen, search, direction]);

    // Utilitário para fechar a lista e esconder o teclado ao selecionar o item
    const fecharELimpar = useCallback(() => {
        setIsOpen(false);
        setSearch('');
        if (document.activeElement) document.activeElement.blur();
    }, []);

    return {
        isOpen, setIsOpen,
        search, setSearch,
        listPos,
        comboRef, listRef,
        handleSmartClick,
        fecharELimpar
    };
}