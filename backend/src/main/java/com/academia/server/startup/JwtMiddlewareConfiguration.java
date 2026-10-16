package com.academia.server.startup;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class JwtMiddlewareConfiguration extends OncePerRequestFilter {

    private final String jwtSecret;

    public JwtMiddlewareConfiguration(@Value("${zenite.jwt.auth}") String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || rotaPublica(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            retornarNaoAutorizado(response, "Não autorizado.");
            return;
        }

        String token = authHeader.substring(7).trim();
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            request.setAttribute("claims", claims);
            request.setAttribute("usuarioId", claims.get("nameid", String.class));
            request.setAttribute("unidadeOrganizacionalId", claims.get("UnidadeOrganizacionalId", String.class));
            request.setAttribute("role", claims.get("role", String.class));

            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            retornarNaoAutorizado(response, "Não autorizado. Token expirado.");
        } catch (JwtException e) {
            retornarNaoAutorizado(response, "Não autorizado. Token inválido.");
        } catch (Exception e) {
            retornarNaoAutorizado(response, "Não autorizado.");
        }
    }

    private boolean rotaPublica(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return path.startsWith("/v1/auth")
                || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/health")
                || (path.startsWith("/v1/unidades-organizacionais") && ("GET".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method)))
                || (path.startsWith("/v1/usuarios") && "POST".equalsIgnoreCase(method));
    }

    private void retornarNaoAutorizado(HttpServletResponse response, String mensagem) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write(mensagem);
    }
}