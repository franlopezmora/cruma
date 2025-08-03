//package com.cruma.service;
//
//import com.cruma.model.Usuario;
//import com.cruma.repository.UsuarioRepository;
//import org.springframework.stereotype.Service;
//import java.util.List;
//import java.util.UUID;
//@Service
//public class UsuarioService {
//
//    private final UsuarioRepository repo;
//
//    public UsuarioService(UsuarioRepository repo) { this.repo = repo; }
//
//    public List<Usuario> list() { return repo.findAll(); }
//
//    public Usuario create(Usuario u) { return repo.save(u); }
//
//    public void delete(UUID id) { repo.deleteById(id); }
//}
