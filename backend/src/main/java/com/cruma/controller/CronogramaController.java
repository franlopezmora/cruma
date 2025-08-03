//package com.cruma.controller;
//
//import com.cruma.model.Cronograma;
//import com.cruma.service.CronogramaService;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/cronogramas")
//public class CronogramaController {
//
//    private final CronogramaService svc;
//
//    public CronogramaController(CronogramaService svc) {
//        this.svc = svc;
//    }
//
//    /** GET /api/cronogramas?usuarioId=<uuid> */
//    @GetMapping
//    public List<Cronograma> list(@RequestParam UUID usuarioId) {
//        return svc.listByUsuario(usuarioId);
//    }
//
//    /** GET /api/cronogramas/{id} */
//    @GetMapping("/{id}")
//    public Cronograma getOne(@PathVariable Long id) {
//        return svc.getOne(id);
//    }
//
//    /** POST /api/cronogramas */
//    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
//    public Cronograma create(@RequestBody Cronograma cuerpo) {
//        // Asegúrate de que cuerpo.getUsuario().getId() ya esté seteado
//        return svc.save(cuerpo);
//    }
//
//    /** PUT /api/cronogramas/{id} */
//    @PutMapping("/{id}")
//    public Cronograma update(@PathVariable Long id,
//                             @RequestBody Cronograma cuerpo) {
//        // Para seguridad, reusamos el ID de la URL
//        cuerpo.setId(id);
//        return svc.save(cuerpo);
//    }
//
//    /** DELETE /api/cronogramas/{id} */
//    @DeleteMapping("/{id}")
//    @ResponseStatus(HttpStatus.NO_CONTENT)
//    public void delete(@PathVariable Long id) {
//        svc.delete(id);
//    }
//}
