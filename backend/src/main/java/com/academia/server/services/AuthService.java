package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.UnauthorizedAccessException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.Auth;
import com.academia.server.models.CodigoAcesso;
import com.academia.server.models.JornadaUsuario;
import com.academia.server.models.Usuario;
import com.academia.server.repositories.AuthRepository;
import com.academia.server.utils.DateTimeHelper;
import com.academia.server.validations.ValidationError;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService extends BaseService {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final String jwtSecret;
    private static final SecureRandom RANDOM = new SecureRandom();

    public AuthService(
            AuthRepository authRepository,
            PasswordEncoder passwordEncoder,
            @Value("${zenite.jwt.auth}") String jwtSecret) {
        this.authRepository = authRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtSecret = jwtSecret;
    }

    public Auth.AuthLoginResponse login(Auth auth) throws Exception {
        validarAuth(auth);

        Usuario usuario = authRepository.obterUsername(auth.getUsername(), auth.getUnidadeOrganizacionalId());
        if (usuario == null) {
            throw new UnauthorizedAccessException("Usuário não encontrado para a unidade organizacional informada.");
        }

        if (!passwordEncoder.matches(auth.getSenha(), usuario.getSenha())) {
            throw new UnauthorizedAccessException("Usuário ou senha incorretos.");
        }

        if (usuario.isCadastroCompleto()) {
            if (usuario.getJornadaUsuario() != JornadaUsuario.Completed) {
                authRepository.atualizarJornadaUsuario(usuario.getUsuarioId(), JornadaUsuario.Completed);
                usuario.setJornadaUsuario(JornadaUsuario.Completed);
            }
            Auth.AuthLoginResponse res = new Auth.AuthLoginResponse();
            res.setToken(gerarTokenJwt(usuario));
            return res;
        }

        if (usuario.getJornadaUsuario() == JornadaUsuario.CodeValidatePage) {
            Auth.AuthLoginResponse res = new Auth.AuthLoginResponse();
            res.setJornadaUsuario(usuario.getJornadaUsuario());
            res.setMessage("Valide o código de 6 dígitos enviado.");
            return res;
        }

        Auth.AuthLoginResponse res = new Auth.AuthLoginResponse();
        res.setJornadaUsuario(JornadaUsuario.WaitingApprovalPage);
        res.setMessage("Isso pode levar até algumas horas.");
        return res;
    }

    private String gerarTokenJwt(Usuario usuario) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date expiraEm = Date.from(DateTimeHelper.saoPaulo().plusDays(30).toInstant(ZoneOffset.ofHours(-3)));

        return Jwts.builder()
                .subject(usuario.getUsuarioId().toString())
                .claim("nameid", usuario.getUsuarioId().toString())
                .claim("unique_name", usuario.getUsername())
                .claim("Nome", usuario.getNome())
                .claim("UnidadeOrganizacionalId", usuario.getUnidadeOrganizacionalId().toString())
                .claim("role", usuario.getPerfil().name())
                .claim("CadastroCompleto", String.valueOf(usuario.isCadastroCompleto()))
                .claim("JornadaUsuario", usuario.getJornadaUsuario().name())
                .expiration(expiraEm)
                .signWith(key)
                .compact();
    }

    public void esquecerSenha(Auth auth) throws Exception {
        validarAuthForgot(auth);

        Usuario usuario = authRepository.obterUsername(auth.getUsername(), auth.getUnidadeOrganizacionalId());
        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado para a unidade organizacional informada.");
        }

        boolean emCooldown = authRepository.buscarUltimoCodigo(
                usuario.getUsuarioId(), LocalDateTime.of(1970, 1, 1, 0, 0), 5, 2
        );
        if (emCooldown) {
            throw new IllegalStateException("Aguarde 5 minutos para solicitar um novo código de recuperação.");
        }

        String codigoGerado = gerarCodigoAcesso();
        authRepository.inserirCodigoAcesso(usuario.getUsuarioId(), codigoGerado);
    }

    public void reenviarCodigoCadastro(Auth auth) throws Exception {
        validarAuthForgot(auth);

        Usuario usuario = authRepository.obterUsername(auth.getUsername(), auth.getUnidadeOrganizacionalId());
        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        if (usuario.getJornadaUsuario() != JornadaUsuario.CodeValidatePage) {
            throw new IllegalStateException("Este cadastro não está aguardando validação de código.");
        }

        boolean emCooldown = authRepository.buscarUltimoCodigo(
                usuario.getUsuarioId(), LocalDateTime.of(1970, 1, 1, 0, 0), 5, 2
        );
        if (emCooldown) {
            throw new IllegalStateException("Aguarde 5 minutos para solicitar um novo código.");
        }

        String codigoGerado = gerarCodigoAcesso();
        authRepository.inserirCodigoAcesso(usuario.getUsuarioId(), codigoGerado);
    }

    public Auth.AuthVerifyResponse verificarCodigo(Auth.AuthVerify auth) throws Exception {
        validarAuthVerify(auth);

        Usuario usuario = null;
        if (auth.getUsername() != null && !auth.getUsername().isBlank() && auth.getUnidadeOrganizacionalId() != null) {
            usuario = authRepository.obterUsername(auth.getUsername(), auth.getUnidadeOrganizacionalId());
        }

        CodigoAcesso codigoAcesso = authRepository.obterCodigoPorSms(
                auth.getCode(), usuario != null ? usuario.getUsuarioId() : null
        );
        if (codigoAcesso == null) {
            throw new NotFoundException("Código não encontrado.");
        }

        if (codigoAcesso.isUtilizado()) {
            throw new IllegalStateException("Este código já foi utilizado.");
        }

        if (DateTimeHelper.saoPaulo().isAfter(codigoAcesso.getDataSolicitacao().plusMinutes(5))) {
            throw new IllegalStateException("O tempo de validação deste código expirou.");
        }

        boolean existeMaisRecente = authRepository.buscarUltimoCodigo(
                codigoAcesso.getUsuarioId(), codigoAcesso.getDataSolicitacao(), null, 1
        );
        if (existeMaisRecente) {
            throw new IllegalStateException("Este código foi invalidado porque uma nova solicitação foi feita.");
        }

        if (usuario == null) {
            usuario = authRepository.obterUsuario(codigoAcesso.getUsuarioId());
        }
        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        if (usuario.getJornadaUsuario() == JornadaUsuario.CodeValidatePage) {
            authRepository.atualizarCodigoCadastroValidado(codigoAcesso.getUsuarioId(), codigoAcesso.getCodigo());
            authRepository.atualizarJornadaUsuario(codigoAcesso.getUsuarioId(), JornadaUsuario.WaitingApprovalPage);

            Auth.AuthVerifyResponse res = new Auth.AuthVerifyResponse();
            res.setJornadaUsuario(JornadaUsuario.WaitingApprovalPage);
            res.setMessage("Código validado com sucesso.");
            return res;
        }

        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        String codigoResetId = HexFormat.of().formatHex(randomBytes);

        authRepository.atualizarCodigoValidado(codigoAcesso.getUsuarioId(), codigoAcesso.getCodigo(), codigoResetId);

        Auth.AuthVerifyResponse res = new Auth.AuthVerifyResponse();
        res.setCodigoResetId(codigoResetId);
        return res;
    }

    public void redefinirSenha(Auth.AuthReset auth) throws Exception {
        if (auth.getCodigoAcessoId() == null || auth.getCodigoAcessoId().isBlank()) {
            throw new IllegalStateException("Código de acesso não informado.");
        }

        validarAuthReset(auth);

        CodigoAcesso codigoAcesso = authRepository.obterCodigoPorId(auth.getCodigoAcessoId());
        if (codigoAcesso == null) {
            throw new NotFoundException("Código de acesso inválido ou não encontrado.");
        }
        if (!codigoAcesso.isUtilizado()) {
            throw new IllegalStateException("Este código não foi validado. Volte e informe os 6 dígitos primeiro.");
        }
        if (codigoAcesso.isResetEfetuado()) {
            throw new IllegalStateException("Este código de acesso já foi utilizado.");
        }
        if (codigoAcesso.getDataResetId() != null && DateTimeHelper.saoPaulo().isAfter(codigoAcesso.getDataResetId().plusMinutes(5))) {
            throw new IllegalStateException("O tempo limite para utilizar este código expirou. Solicite um novo código.");
        }

        boolean existeMaisRecente = authRepository.buscarUltimoCodigo(
                codigoAcesso.getUsuarioId(), codigoAcesso.getDataSolicitacao(), null, 1
        );
        if (existeMaisRecente) {
            throw new IllegalStateException("Esta sessão expirou porque um novo código foi solicitado recentemente.");
        }

        String hashedSenha = passwordEncoder.encode(auth.getSenha());
        authRepository.redefinirSenha(codigoAcesso.getUsuarioId(), hashedSenha);
        authRepository.marcarResetEfetuado(codigoAcesso.getCodigoResetId());
    }

    public static String gerarCodigoAcesso() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }

    private void validarAuth(Auth auth) {
        List<ValidationError> errors = createErrorList();
        if (auth.getUsername() == null || auth.getUsername().isBlank())
            addError(errors, "Username", "Informe o username.");
        if (auth.getSenha() == null || auth.getSenha().isBlank())
            addError(errors, "Senha", "Informe a senha.");
        if (auth.getUnidadeOrganizacionalId() == null)
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        if (!errors.isEmpty()) throw new ValidationException(errors);
    }

    private void validarAuthForgot(Auth auth) {
        List<ValidationError> errors = createErrorList();
        if (auth.getUsername() == null || auth.getUsername().isBlank())
            addError(errors, "Username", "Informe o username.");
        if (auth.getUnidadeOrganizacionalId() == null)
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        if (!errors.isEmpty()) throw new ValidationException(errors);
    }

    private void validarAuthVerify(Auth.AuthVerify auth) {
        List<ValidationError> errors = createErrorList();
        if (auth.getCode() == null || auth.getCode().isBlank())
            addError(errors, "Code", "Informe o código.");
        if (!errors.isEmpty()) throw new ValidationException(errors);
    }

    private void validarAuthReset(Auth.AuthReset auth) {
        List<ValidationError> errors = createErrorList();
        if (auth.getSenha() == null || auth.getSenha().isBlank())
            addError(errors, "Senha", "Informe a nova senha.");
        if (auth.getConfirmaSenha() == null || auth.getConfirmaSenha().isBlank())
            addError(errors, "ConfirmaSenha", "Confirme a nova senha.");
        if (auth.getSenha() != null && !auth.getSenha().isBlank()
                && auth.getConfirmaSenha() != null && !auth.getConfirmaSenha().isBlank()
                && !auth.getSenha().equals(auth.getConfirmaSenha())) {
            addError(errors, "ConfirmaSenha", "A senha e a confirmação devem ser iguais.");
        }
        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}