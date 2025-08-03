package com.cruma.controller;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ByteArrayResource;
import com.cruma.dto.BloqueCronogramaExportDTO;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.awt.Color;

@RestController
@RequestMapping("/api/cronograma")
public class ExportarCronogramaController {

    static class FooterEvent extends PdfPageEventHelper {
        private final Image linkedin;
        private final Image logo;
        private final Font fontFooter;

        public FooterEvent(Image linkedin, Image logo, Font fontFooter) {
            this.linkedin = linkedin;
            this.logo = logo;
            this.fontFooter = fontFooter;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            PdfPTable table = new PdfPTable(3);
            try {
                table.setWidths(new int[]{1, 1, 7});
                table.setTotalWidth(520);
                table.setLockedWidth(true);

                PdfPCell logoCell = new PdfPCell(logo, false);
                logoCell.setBorder(Rectangle.NO_BORDER);
                logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                logoCell.setPaddingRight(6f);
                table.addCell(logoCell);

                PdfPCell linkedinCell = new PdfPCell(linkedin, false);
                linkedinCell.setBorder(Rectangle.NO_BORDER);
                linkedinCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(linkedinCell);

                Phrase p = new Phrase();
                Anchor link1 = new Anchor("Francisco López Mora", fontFooter);
                link1.setReference("https://www.linkedin.com/in/franciscolopezmora/");
                Anchor link2 = new Anchor("Nicolás Soto Garay", fontFooter);
                link2.setReference("https://www.linkedin.com/in/franconicolassotogaray/");
                p.add(link1);
                p.add("   |   ");
                p.add(link2);

                PdfPCell namesCell = new PdfPCell(p);
                namesCell.setBorder(Rectangle.NO_BORDER);
                namesCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(namesCell);

                float x = document.left() + 10;
                float y = document.bottom() + 38;
                table.writeSelectedRows(0, -1, x, y, cb);

            } catch (Exception e) {}
        }
    }

    @PostMapping("/exportar-pdf")
    public ResponseEntity<ByteArrayResource> exportarPDF(@RequestBody List<BloqueCronogramaExportDTO> bloques) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            System.out.println("=== BLOQUES RECIBIDOS PARA EXPORTAR ===");
            for (BloqueCronogramaExportDTO b : bloques) {
                System.out.println(
                        b.getNombreMateria() + " | Día: " + b.getDia() +
                                " | " + b.getHoraEntrada() + "-" + b.getHoraSalida() +
                                " | Com: " + b.getComisionId() + " | Sec: " + b.getSeccion()
                );
            }
            System.out.println("=== FIN BLOQUES ===");

            Document document = new Document(PageSize.A4.rotate(), 8, 8, 8, 8);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            BaseFont ptsans = BaseFont.createFont(getClass().getResource("/static/PTSans-Regular.ttf").toString(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font fontHeader = new Font(ptsans, 8, Font.BOLD, Color.WHITE);
            Font fontBody = new Font(ptsans, 6);
            Font fontFooter = new Font(ptsans, 9, Font.UNDERLINE, new Color(10, 110, 200));

            int startHour = 8, endHour = 23, step = 5;
            List<String> timeSlots = new ArrayList<>();
            for (int h = startHour; h <= endHour; h++) {
                for (int m = 0; m < 60; m += step) {
                    if (h == 23 && m > 5) break;
                    timeSlots.add(String.format("%02d:%02d", h, m));
                }
            }

            bloques.sort(Comparator.comparing(BloqueCronogramaExportDTO::getDia)
                    .thenComparing(BloqueCronogramaExportDTO::getHoraEntrada));

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            float[] widths = {1.4f, 2.1f, 2.1f, 2.1f, 2.1f, 2.1f, 2.1f};
            table.setWidths(widths);

            String[] dias = {"Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"};
            for (String d : dias) {
                PdfPCell cell = new PdfPCell(new Phrase(d, fontHeader));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(new Color(12, 192, 223));
                cell.setPadding(1f);
                cell.setBorder(Rectangle.TOP | Rectangle.LEFT | Rectangle.RIGHT);
                table.addCell(cell);
            }

            // Para cada día y bloque, calculamos el rango de filas (timeSlots) que ocupa cada bloque
            // Guardamos en un mapa para lookup rápido: Map<fila, Map<dia, Bloque>>
            Map<Integer, Map<Integer, BloqueCronogramaExportDTO>> bloquePorFilaDia = new HashMap<>();
            Map<Integer, Map<Integer, Boolean>> esInicioBloque = new HashMap<>(); // Para imprimir texto solo al inicio

            for (int dia = 1; dia <= 6; dia++) {
                for (BloqueCronogramaExportDTO b : bloques) {
                    if (b.getDia() != dia) continue;

                    int startMin = Integer.parseInt(b.getHoraEntrada().split(":")[0]) * 60 +
                            Integer.parseInt(b.getHoraEntrada().split(":")[1]);
                    int endMin   = Integer.parseInt(b.getHoraSalida().split(":")[0]) * 60 +
                            Integer.parseInt(b.getHoraSalida().split(":")[1]);
                    for (int fila = 0; fila < timeSlots.size(); fila++) {
                        int slotMin = Integer.parseInt(timeSlots.get(fila).split(":")[0]) * 60 +
                                Integer.parseInt(timeSlots.get(fila).split(":")[1]);
                        if (slotMin >= startMin && slotMin < endMin) {
                            // Guardar bloque para ese día/fila
                            bloquePorFilaDia.computeIfAbsent(fila, k -> new HashMap<>()).put(dia, b);
                            // Marcamos si este es el inicio del bloque
                            if (slotMin == startMin) {
                                esInicioBloque.computeIfAbsent(fila, k -> new HashMap<>()).put(dia, true);
                            }
                        }
                    }
                }
            }

            for (int fila = 0; fila < timeSlots.size(); fila++) {
                // Columna de horario
                PdfPCell horaCell;
                String time = timeSlots.get(fila);
                if (time.endsWith(":00") || time.endsWith(":30")) {
                    horaCell = new PdfPCell(new Phrase(time, fontBody));
                } else {
                    horaCell = new PdfPCell(new Phrase(""));
                }
                horaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                horaCell.setBackgroundColor(new Color(235,245,250));
                horaCell.setPadding(0.75f);
                horaCell.setBorder(Rectangle.LEFT | Rectangle.RIGHT);
                table.addCell(horaCell);

                for (int dia = 1; dia <= 6; dia++) {
                    BloqueCronogramaExportDTO match = null;
                    if (bloquePorFilaDia.containsKey(fila) && bloquePorFilaDia.get(fila).containsKey(dia)) {
                        match = bloquePorFilaDia.get(fila).get(dia);
                    }
                    if (match != null) {
                        boolean showText = esInicioBloque.containsKey(fila) && esInicioBloque.get(fila).containsKey(dia);
                        PdfPCell blockCell;
                        if (showText) {
                            String materiaText = match.getNombreMateria() +
                                    (match.getSeccion()!=null ? " ("+match.getSeccion()+")" : "") +
                                    "\n" + match.getHoraEntrada() + " - " + match.getHoraSalida();
                            blockCell = new PdfPCell(new Phrase(materiaText, fontBody));
                        } else {
                            blockCell = new PdfPCell(new Phrase(""));
                        }
                        blockCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        blockCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        blockCell.setBackgroundColor(new Color(221, 246, 255));
                        blockCell.setPadding(0.75f);
                        blockCell.setBorder(Rectangle.LEFT | Rectangle.RIGHT);
                        table.addCell(blockCell);
                    } else {
                        PdfPCell cell = new PdfPCell(new Phrase(""));
                        cell.setPadding(0.75f);
                        cell.setBorder(Rectangle.LEFT | Rectangle.RIGHT);
                        table.addCell(cell);
                    }
                }
            }

            document.add(table);

            Image linkedinLogo = Image.getInstance(getClass().getResource("/static/linkedin.png"));
            linkedinLogo.scaleToFit(16, 16);
            Image crumaLogo = Image.getInstance(getClass().getResource("/static/CRUMA.png"));
            crumaLogo.scaleToFit(30, 30);
            writer.setPageEvent(new FooterEvent(linkedinLogo, crumaLogo, fontFooter));

            document.close();

            ByteArrayResource resource = new ByteArrayResource(baos.toByteArray());
            HttpHeaders headersResp = new HttpHeaders();
            headersResp.setContentType(MediaType.APPLICATION_PDF);
            headersResp.setContentDisposition(ContentDisposition.attachment().filename("cronogramaCRUMA.pdf").build());

            return ResponseEntity.ok()
                    .headers(headersResp)
                    .contentLength(resource.contentLength())
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
