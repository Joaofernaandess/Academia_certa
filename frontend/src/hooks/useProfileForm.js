import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../utils/apiUtils';
import { encryptedJsonBody } from '../utils/payloadCrypto';

export const useProfileForm = ({ token, usuario }) => {
    const navigate = useNavigate();
    const nomeOriginal = usuario.nome || '';
    const [formData, setFormData] = useState({
        nome: nomeOriginal,
        username: usuario.username,
        unidadeOrganizacionalId: usuario.unidadeOrganizacionalId
    });
    
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    
    const [isSaving, setIsSaving] = useState(false);

    const hasChanges = formData.nome.trim() !== nomeOriginal.trim();

    const handleUpdateData = async (e) => {
        e.preventDefault();
        if (isSaving || !hasChanges) return;

        setErro('');
        setSucesso('');
        setFieldErrors({});
        setIsSaving(true);

        const payload = { nome: formData.nome };

        try {
            const response = await fetch(`${getBaseUrl()}/v1/usuarios/${usuario.usuarioId}/nome`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: await encryptedJsonBody(payload)
            });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                if (mensagem) setSucesso(mensagem);
            } else if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
            } else {
                const mensagem = await extrairErro(response);
                setErro(mensagem);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelProfile = () => {
        setErro('');
        setSucesso('');
        setFieldErrors({});
        navigate('/');
    };

    const clearMessages = () => {
        const shouldNavigateHome = Boolean(sucesso);
        setErro('');
        setSucesso('');
        if (shouldNavigateHome) {
            navigate('/', { replace: true });
        }
    };

    return {
        erro,
        sucesso,
        fieldErrors,
        formData,
        hasChanges,
        setFormData,
        handleUpdateData,
        handleCancelProfile,
        clearMessages,
        isSaving
    };
};