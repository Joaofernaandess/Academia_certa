export const carregarTodasPaginas = async (buscarPagina) => {
    const itens = [];
    let skip = 0;

    for (let pagina = 0; pagina < 100; pagina += 1) {
        const response = await buscarPagina(skip);

        if (!response.ok) {
            return { ok: false, response, itens };
        }

        const data = await response.json();
        const paginaItens = Array.isArray(data) ? data : [];

        if (paginaItens.length === 0) break;

        itens.push(...paginaItens);
        skip += paginaItens.length;
    }

    return { ok: true, itens };
};
