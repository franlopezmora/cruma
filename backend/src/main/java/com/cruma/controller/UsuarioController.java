//package com.cruma.controller;
//
//import com.cruma.model.Usuario;
//import com.cruma.service.UsuarioService;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/usuarios")
//public class UsuarioController {
//    private final UsuarioService svc;
//    public UsuarioController(UsuarioService svc) { this.svc = svc; }
//
//    @GetMapping
//    public List<Usuario> all() { return svc.list(); }
//
//    @PostMapping
//    public Usuario create(@RequestBody Usuario u) { return svc.create(u); }
//
//    @DeleteMapping("/{id}")
//    public void delete(@PathVariable UUID id) { svc.delete(id); }
//}