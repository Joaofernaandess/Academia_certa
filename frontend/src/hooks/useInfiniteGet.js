import { useCallback, useEffect, useRef, useState } from 'react';
import { getBaseUrl } from '../utils/apiConfig';
import { extrairErro } from '../utils/apiUtils';

const estaNoFimDaLista = (container, margem = 1) => {
  const distanciaAteFim = container.scrollHeight - container.clientHeight - container.scrollTop;
  const temScrollReal = container.scrollHeight > container.clientHeight + 1;

  return temScrollReal && distanciaAteFim <= margem;
};

const montarQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor === undefined || valor === null || valor === '') return;
    query.set(chave, valor);
  });

  return query.toString();
};

export default function useInfiniteGet({
  endpoint,
  token,
  params = {},
  getItemId,
  errorMessage = 'Não foi possível carregar os dados.',
  dragThreshold = 70
}) {
  const touchStartYRef = useRef(null);
  const touchNoFimRef = useRef(false);
  const carregouPorArrasteRef = useRef(false);
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async ({ reset = false, skipAtual = 0, silencioso = false } = {}) => {
    if (!silencioso) setErro('');

    if (reset && !silencioso) {
      setLoading(true);
    } else if (!reset) {
      setLoadingMais(true);
    }

    try {
      const query = montarQuery({
        ...params,
        skip: skipAtual
      });

      const response = await fetch(`${getBaseUrl()}${endpoint}${query ? `?${query}` : ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const resposta = await response.json();
        const novosItems = Array.isArray(resposta) ? resposta : [];

        setItems(prev => {
          if (reset) return novosItems;
          if (!getItemId) return [...prev, ...novosItems];

          const idsAtuais = new Set(prev.map(item => getItemId(item)));
          const itemsSemDuplicidade = novosItems.filter(item => !idsAtuais.has(getItemId(item)));

          return [...prev, ...itemsSemDuplicidade];
        });

        setSkip(skipAtual + novosItems.length);
        setTemMais(novosItems.length > 0);

        return novosItems.length;
      }

      const mensagem = await extrairErro(response);
      if (mensagem && !silencioso) setErro(mensagem);
    } catch (error) {
      console.error(error);
      if (!silencioso) setErro(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }

    return null;
  }, [endpoint, errorMessage, getItemId, params, token]);

  const recarregar = useCallback(({ silencioso = false } = {}) => {
    setSkip(0);
    setTemMais(true);
    carregar({ reset: true, skipAtual: 0, silencioso });
  }, [carregar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const carregarMais = useCallback(async () => {
    if (loading || loadingMais || !temMais) return;

    await carregar({ skipAtual: skip });
  }, [carregar, loading, loadingMais, skip, temMais]);

  const handleWheel = useCallback((event) => {
    if (event.deltaY <= 0) return;
    if (!estaNoFimDaLista(event.currentTarget)) return;

    carregarMais();
  }, [carregarMais]);

  const handleTouchStart = useCallback((event) => {
    const container = event.currentTarget;

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchNoFimRef.current = estaNoFimDaLista(container);
    carregouPorArrasteRef.current = false;
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (touchStartYRef.current === null) return;

    const container = event.currentTarget;
    const touchAtualY = event.touches[0]?.clientY ?? touchStartYRef.current;
    const distanciaArrastada = touchStartYRef.current - touchAtualY;

    if (estaNoFimDaLista(container)) {
      touchNoFimRef.current = true;
    }

    if (!touchNoFimRef.current) return;
    if (distanciaArrastada < dragThreshold) return;
    if (carregouPorArrasteRef.current) return;

    carregouPorArrasteRef.current = true;
    carregarMais();
  }, [carregarMais, dragThreshold]);

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchNoFimRef.current = false;
    carregouPorArrasteRef.current = false;
  }, []);

  return {
    items,
    setItems,
    loading,
    loadingMais,
    erro,
    setErro,
    temMais,
    recarregar,
    carregarMais,
    scrollHandlers: {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
}
