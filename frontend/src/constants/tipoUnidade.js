export const TIPO_UNIDADE = {
    1: 'Litros (L)',
    2: 'Mililitros (ML)',
    3: 'Quilos (KG)',
    4: 'Gramas (G)',
    5: 'Miligramas (MG)',
    6: 'Unidades (UN)'
};

export const getTipoUnidadeSigla = (tipoUnidadeMedida) => {
    const unidade = TIPO_UNIDADE[tipoUnidadeMedida] || TIPO_UNIDADE[6];
    return unidade.match(/\(([^)]+)\)/)?.[1] || unidade;
};
