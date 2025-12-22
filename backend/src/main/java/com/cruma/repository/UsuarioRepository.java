package com.cruma.repository;

import com.cruma.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    /**
     * Busca un usuario por su email.
     *
     * @param mail el correo único del usuario
     * @return un Optional con el Usuario si existe
     */
    Optional<Usuario> findByMail(String mail);

    /**
     * Busca un usuario por su email cargando también sus proveedores OAuth.
     * Útil para evitar problemas de lazy loading.
     */
    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.proveedores WHERE u.mail = :mail")
    Optional<Usuario> findByMailWithProveedores(@Param("mail") String mail);
}
