//package com.cruma.repository;
//
//import com.cruma.model.Usuario;
//import org.springframework.data.jpa.repository.JpaRepository;
//import java.util.Optional;
//import java.util.UUID;
//
//public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
//    /**
//     * Busca un usuario por su email.
//     * @param mail el correo único del usuario
//     * @return un Optional con el Usuario si existe
//     */
//    Optional<Usuario> findByMail(String mail);
//}
