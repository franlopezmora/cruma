package com.cruma.controller;

import com.cruma.model.Usuario;
import com.cruma.service.UsuarioService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService svc;

    public UsuarioController(UsuarioService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<Usuario> all() {
        return svc.list();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        svc.delete(id);
    }
}