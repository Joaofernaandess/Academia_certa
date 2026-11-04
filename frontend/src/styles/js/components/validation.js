document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-demo');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            const campos = form.querySelectorAll('input, textarea');

            campos.forEach(campo => {
                campo.classList.remove('is-valid', 'is-invalid');

                if (campo.checkValidity()) {
                    campo.classList.add('is-valid');
                } else {
                    campo.classList.add('is-invalid');
                    isValid = false;
                }
            });

            if (isValid) {
                alert('Sucesso! O formulário está perfeitamente preenchido.');
            }
        });

        form.addEventListener('reset', () => {
            const campos = form.querySelectorAll('input, textarea');
            campos.forEach(campo => {
                campo.classList.remove('is-valid', 'is-invalid');
            });
        });
    }
});