export const MAX_ORGANIZATION_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg'];

export const validateOrganizationLogo = (file) => {
    if (!file) return 'Selecione uma imagem.';
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) return 'Use uma imagem PNG ou JPG.';
    if (file.size > MAX_ORGANIZATION_LOGO_SIZE) return 'A imagem deve ter no máximo 2 MB.';
    return '';
};

export const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
});
