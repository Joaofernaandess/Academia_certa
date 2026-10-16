package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.JornadaUsuario;
import com.academia.server.models.PerfilUsuario;
import com.academia.server.models.Usuario;
import com.academia.server.repositories.AuthRepository;
import com.academia.server.repositories.UnidadeOrganizacionalRepository;
import com.academia.server.repositories.UsuarioRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService extends BaseService {

    private final UsuarioRepository usuarioRepository;
    private final UnidadeOrganizacionalRepository unidadeRepository;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            UnidadeOrganizacionalRepository unidadeRepository,
            AuthRepository authRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.unidadeRepository = unidadeRepository;
        this.authRepository = authRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UUID cadastrar(Usuario usuario) throws Exception {
        validarCampos(usuario, new UUID(0L, 0L));

        usuario.setPerfil(PerfilUsuario.Normal);
        usuario.setCadastroCompleto(false);
        usuario.setJornadaUsuario(JornadaUsuario.CodeValidatePage);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        UUID usuarioId = usuarioRepository.cadastrar(usuario);
        String codigoGerado = AuthService.gerarCodigoAcesso();
        authRepository.inserirCodigoAcesso(usuarioId, codigoGerado);

        return usuarioId;
    }

    public void atualizarNome(Usuario.UsuarioPatchRequest req, UUID usuarioId) throws Exception {
        List<ValidationError> errors = createErrorList();
        if (req.getNome() == null || req.getNome().isBlank()) {
            addError(errors, "Nome", "Informe o nome.");
            throw new ValidationException(errors);
        }
        int affected = usuarioRepository.atualizarNome(req, usuarioId);
        if (affected <= 0) throw new NotFoundException("Usuário não encontrado com os parâmetros informados.");
    }

    public void validarAcesso(UUID usuarioId) throws Exception {
        Usuario usuario = usuarioRepository.obter(usuarioId);
        if (usuario == null) throw new NotFoundException("Usuário não encontrado com o ID informado.");
        if (usuario.isCadastroCompleto()) throw new IllegalStateException("O acesso do usuário já está validado.");
        if (usuario.getJornadaUsuario() != JornadaUsuario.WaitingApprovalPage) {
            throw new IllegalStateException("O usuário ainda não concluiu a validação do código de cadastro.");
        }
        usuarioRepository.validarAcesso(usuarioId);
    }

    public List<Usuario.UsuarioGetResponse> obterLista(String username, UUID unidadeId, Boolean cadastroCompleto, int skip, int top) throws Exception {
        return usuarioRepository.obterLista(username, unidadeId, cadastroCompleto, skip, top);
    }

    public Usuario obter(UUID usuarioId) throws Exception {
        Usuario u = usuarioRepository.obter(usuarioId);
        if (u == null) throw new NotFoundException("Usuário não encontrado com o ID informado.");
        return u;
    }

    private void validarCampos(Usuario usuario, UUID ignoreId) throws Exception {
        List<ValidationError> errors = createErrorList();

        if (usuario.getUnidadeOrganizacionalId() == null) {
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        } else if (unidadeRepository.obter(usuario.getUnidadeOrganizacionalId()) == null) {
            addError(errors, "UnidadeOrganizacionalId", "Unidade organizacional não encontrada.");
        }

        if (usuario.getUsername() == null || usuario.getUsername().isBlank()) {
            addError(errors, "Username", "Informe o username");
        } else if (usuario.getUnidadeOrganizacionalId() != null &&
                   usuarioRepository.verificarUsuarioExiste(usuario.getUsername(), usuario.getUnidadeOrganizacionalId(), ignoreId)) {
            addError(errors, "Username", "Este username já está sendo utilizado.");
        }

        if (usuario.getSenha() == null || usuario.getSenha().isBlank())
            addError(errors, "Senha", "Informe a senha.");
        if (usuario.getConfirmaSenha() == null || usuario.getConfirmaSenha().isBlank())
            addError(errors, "ConfirmaSenha", "Confirme a senha.");
        if (usuario.getSenha() != null && !usuario.getSenha().isBlank() &&
            usuario.getConfirmaSenha() != null && !usuario.getConfirmaSenha().isBlank() &&
            !usuario.getSenha().equals(usuario.getConfirmaSenha())) {
            addError(errors, "ConfirmaSenha", "A senha e a confirmação devem ser iguais.");
        }

        if (usuario.getNome() == null || usuario.getNome().isBlank())
            addError(errors, "Nome", "Informe o nome.");

        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}