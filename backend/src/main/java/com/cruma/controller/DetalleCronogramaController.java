//package com.cruma.controller;
//
//import com.cruma.model.DetalleCronograma;
//import com.cruma.service.DetalleCronogramaService;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/cronogramas/{cronogramaId}/detalles")
//public class DetalleCronogramaController {
//
//    private final DetalleCronogramaService svc;
//
//    public DetalleCronogramaController(DetalleCronogramaService svc) {
//        this.svc = svc;
//    }
//
//    /** Listar todos los detalles de un cronograma */
//    @GetMapping
//    public List<DetalleCronograma> list(@PathVariable Long cronogramaId) {
//        return svc.listByCronograma(cronogramaId);
//    }
//
//    /** Añadir un nuevo detalle */
//    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
//    public DetalleCronograma add(@PathVariable Long cronogramaId,
//                                 @RequestBody DetalleCronograma body) {
//        // Asociamos al cronograma que ya existe
//        body.setCronograma(new com.cruma.model.Cronograma());
//        body.getCronograma().setId(cronogramaId);
//        return svc.add(body);
//    }
//
//    /** Eliminar un detalle por su ID */
//    @DeleteMapping("/{detalleId}")
//    @ResponseStatus(HttpStatus.NO_CONTENT)
//    public void remove(@PathVariable Long detalleId) {
//        svc.remove(detalleId);
//    }
//}
