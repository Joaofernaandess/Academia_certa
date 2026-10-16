import { useCallback, useMemo, useState } from 'react';
import useInfiniteGet from '../hooks/useInfiniteGet';
import { getBaseUrl } from '../utils/apiConfig';
import { extrairErro, extrairMensagem } from '../utils/apiUtils';
import { formatCnpj } from '../utils/cnpj';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { formatPhone } from '../utils/phone';
import LoadingWaves from './LoadingWaves';
import MessageModal from './MessageModal';
import ZeniteIcon from './ZeniteIcon';
import LoadingButton from './LoadingButton';

const getUnidadeId = (unidade) => unidade?.unidadeOrganizacionalId || unidade?.id;
const getNomeEmpresa = (unidade) => unidade?.razaoSocial || unidade?.nomeFantasia || unidade?.nome || 'Empresa sem nome';

const isValorVerdadeiro = (valor) => valor === true || valor === 1 || String(valor).toLowerCase() === 'true';

const isUnidadeAprovada = (unidade) => [
    unidade?.aprovado,
    unidade?.Aprovado,
    unidade?.aprovada,
    unidade?.Aprovada,
    unidade?.validado,
    unidade?.Validado,
    unidade?.validada,
    unidade?.Validada
].some(isValorVerdadeiro);

export default function AprovarUnidadeOrganizacionalView({ token }) {
    const [pesquisa, setPesquisa] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [unidadeOrganizacionalParaAprovar, setUnidadeOrganizacionalParaAprovar] = useState(null);
    const [isApproving, setIsApproving] = useState(false);

    const unidadeGetParams = useMemo(() => ({
        aprovado: false,
        sort: 'razao_social asc'
    }), []);

    const obterUnidadeId = useCallback((unidade) => getUnidadeId(unidade), []);

    const {
        items: unidadesOrganizacionais,
        setItems: setUnidadesOrganizacionais,
        loading,
        loadingMais,
        erro,
        setErro,
        scrollHandlers
    } = useInfiniteGet({
        endpoint: '/v1/unidades-organizacionais',
        token,
        params: unidadeGetParams,
        getItemId: obterUnidadeId,
        errorMessage: 'Não foi possível carregar as empresas pendentes.'
    });

    const handleAprovar = async () => {
        const unidadeOrganizacionalId = getUnidadeId(unidadeOrganizacionalParaAprovar);
        if (!unidadeOrganizacionalId || isApproving) return;

        setErro('');
        setSucesso('');
        setIsApproving(true);

        try {
            const response = await fetch(`${getBaseUrl()}/v1/unidades-organizacionais/${unidadeOrganizacionalId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: await encryptedJsonBody({ unidadeOrganizacionalId })
            });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                if (mensagem) setSucesso(mensagem);
                setUnidadesOrganizacionais(prev => prev.filter(u => getUnidadeId(u) !== unidadeOrganizacionalId));
                setUnidadeOrganizacionalParaAprovar(null);
            } else {
                setErro(await extrairErro(response));
            }
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setIsApproving(false);
        }
    };

    const renderEmptyState = () => (
        <div className="empty-state-plain validation-empty-state">
            <div className="empty-state-icon">
                <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
            </div>
            <p className="empty-state-text">
                {unidadesOrganizacionais.length === 0 ? 'Nenhuma empresa pendente de aprovação.' : 'Nenhum resultado encontrado para a pesquisa.'}
            </p>
        </div>
    );

    const unidadesOrganizacionaisFiltradas = unidadesOrganizacionais.filter(unidade => {
        if (isUnidadeAprovada(unidade)) return false;
        const termo = pesquisa.trim().toLowerCase();
        if (!termo) return true;

        const cnpj = unidade.cnpj || '';
        const telefone = unidade.telefone || '';

        return (
            getNomeEmpresa(unidade).toLowerCase().includes(termo) ||
            unidade.nomeFantasia?.toLowerCase().includes(termo) ||
            unidade.email?.toLowerCase().includes(termo) ||
            cnpj.toLowerCase().includes(termo) ||
            formatCnpj(cnpj).toLowerCase().includes(termo) ||
            telefone.toLowerCase().includes(termo) ||
            formatPhone(telefone).toLowerCase().includes(termo)
        );
    });

    return (
        <div className="w-full inventory-list-fixed validation-user-view">
            <div className="inventory-list-fixed-header">
                <div className="inventory-list-header">
                    <h2 className="page-title no-margin">Empresas Pendentes</h2>
                </div>
                <div className="inventory-list-header-row mb-1">
                    <div className="inventory-search-wrapper w-full">
                        <label className="space-items-search no-margin">
                            <ZeniteIcon name="search" size={24} />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                className="space-items-search-input w-full no-field-margin"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="inventory-list-scroll validation-user-scroll" {...scrollHandlers}>
                {loading ? (
                    <LoadingWaves variant="cards" rows={4} label="Carregando empresas pendentes" className="validation-loading-grid" />
                ) : unidadesOrganizacionaisFiltradas.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <div className="row validation-user-grid">
                        {unidadesOrganizacionaisFiltradas.map(unidade => (
                            <div key={getUnidadeId(unidade)} className="column-4 mb-1">
                                <div className="card validation-user-card">
                                    <h3 className="validation-user-title">{getNomeEmpresa(unidade)}</h3>
                                    <p className="validation-user-meta">
                                        <strong>CNPJ:</strong> {formatCnpj(unidade.cnpj) || 'Sem CNPJ'}
                                    </p>
                                    <p className="validation-user-description">
                                        <strong>Telefone:</strong> {formatPhone(unidade.telefone) || 'Sem telefone'}
                                    </p>
                                    {unidade.email && (
                                        <p className="validation-user-description">
                                            <strong>Email:</strong> {unidade.email}
                                        </p>
                                    )}
                                    <button className="button button-full" onClick={() => setUnidadeOrganizacionalParaAprovar(unidade)}>
                                        Aprovar Empresa
                                    </button>
                                </div>
                            </div>
                        ))}
                        {loadingMais && (
                            <LoadingWaves variant="cards" rows={1} label="Carregando mais empresas" className="validation-loading-grid" />
                        )}
                    </div>
                )}
            </div>

            {unidadeOrganizacionalParaAprovar && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-card-body">
                            <h2 className="modal-title">Aprovar Empresa</h2>
                            <p className="modal-description">
                                Deseja aprovar a empresa {getNomeEmpresa(unidadeOrganizacionalParaAprovar)}?
                            </p>
                            <div className="modal-actions">
                                <button type="button" className="button button-outline button-flex" onClick={() => setUnidadeOrganizacionalParaAprovar(null)}>
                                    Cancelar
                                </button>
                                <LoadingButton type="button" className="button button-flex" onClick={handleAprovar} loading={isApproving}>
                                    Confirmar
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(erro || sucesso) && (
                <MessageModal
                    type={erro ? 'error' : 'success'}
                    message={erro || sucesso}
                    onClose={() => { setErro(''); setSucesso(''); }}
                    autoClose={8000}
                />
            )}
        </div>
    );
}
