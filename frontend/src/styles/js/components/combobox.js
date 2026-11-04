document.addEventListener('DOMContentLoaded', () => {
  const comboboxes = document.querySelectorAll('.zf-combobox');

  comboboxes.forEach(combobox => {
    const input = combobox.querySelector('.zf-combobox-input');
    const items = combobox.querySelectorAll('.zf-combobox-item');
    const clearBtn = combobox.querySelector('.zf-combobox-clear');

    let activeIndex = -1;

    const toggleClearBtn = () => {
      if (input.value.trim() !== '') {
        combobox.classList.add('has-value');
      } else {
        combobox.classList.remove('has-value');
      }
    };

    const getVisibleItems = () => {
      return Array.from(items).filter(item => item.style.display !== 'none');
    };

    const updateHighlight = (visibleItems) => {
      items.forEach(item => item.classList.remove('highlighted'));
      if (activeIndex >= 0 && activeIndex < visibleItems.length) {
        const activeItem = visibleItems[activeIndex];
        activeItem.classList.add('highlighted');
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    };

    const fecharLista = () => {
      combobox.classList.remove('active');
      activeIndex = -1;
      updateHighlight([]);
    };

    if (clearBtn) {
      clearBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        toggleClearBtn();
        items.forEach(item => item.style.display = '');
        input.focus();
      });
    }

    input.addEventListener('focus', () => {
      combobox.classList.add('active');
      activeIndex = -1;
    });

    input.addEventListener('mousedown', (e) => {
      if (e.offsetX > input.offsetWidth - 40) {
        e.preventDefault();
        combobox.classList.toggle('active');
        if (!combobox.classList.contains('active')) {
          activeIndex = -1;
        }
      }
    });

    //filtra itens
    input.addEventListener('input', (e) => {
      toggleClearBtn();
      const termoPesquisa = e.target.value.toLowerCase();
      combobox.classList.add('active');

      items.forEach(item => {
        const textoItem = item.textContent.toLowerCase();
        item.style.display = textoItem.includes(termoPesquisa) ? '' : 'none';
      });

      activeIndex = -1;
      updateHighlight(getVisibleItems());
    });

    const selecionarItem = (item) => {
      const nomeElemento = item.querySelector('.zf-cb-name');
      const cpfElemento = item.querySelector('.zf-cb-cpf');
      let idSelecionado = item.getAttribute('data-id') || "Sem ID";

      let nomeSelecionado = nomeElemento ? nomeElemento.textContent.trim() : item.textContent.trim();
      input.value = nomeSelecionado;

      toggleClearBtn();
      fecharLista();

      const dadosJSON = {
        id: idSelecionado,
        nome: nomeSelecionado,
        cpf: cpfElemento ? cpfElemento.textContent.trim() : "CPF não encontrado"
      };

      console.log("Objeto Selecionado:", JSON.stringify(dadosJSON, null, 2));
    };

    items.forEach(item => {
      item.addEventListener('click', () => selecionarItem(item));
    });

    input.addEventListener('keydown', (e) => {
      const visibleItems = getVisibleItems();
      const isOpen = combobox.classList.contains('active');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          combobox.classList.add('active');
        } else {
          activeIndex = activeIndex < visibleItems.length - 1 ? activeIndex + 1 : activeIndex;
          updateHighlight(visibleItems);
        }
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isOpen) {
          activeIndex = activeIndex > 0 ? activeIndex - 1 : 0;
          updateHighlight(visibleItems);
        }
      }
      else if (e.key === 'Enter') {
        if (isOpen && activeIndex >= 0 && activeIndex < visibleItems.length) {
          e.preventDefault();
          selecionarItem(visibleItems[activeIndex]);
        }
      }
      else if (e.key === 'Tab') {
        if (isOpen && activeIndex >= 0 && activeIndex < visibleItems.length) {
          e.preventDefault();
          selecionarItem(visibleItems[activeIndex]);
        } else {
          fecharLista();
        }
      }
      else if (e.key === 'Escape') {
        fecharLista();
      }
    });

    document.addEventListener('click', (e) => {
      if (!combobox.contains(e.target)) {
        fecharLista();
      }
    });
  });
});