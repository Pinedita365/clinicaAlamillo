package com.clinicaalamillo.service;

import com.clinicaalamillo.model.Invoice;
import com.clinicaalamillo.model.Treatment;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.InvoiceRepository;
import com.clinicaalamillo.repository.TreatmentRepository;
import com.clinicaalamillo.repository.UserRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Genera presupuestos de tratamientos en PDF usando OpenPDF (LGPL/MPL).
 * Incluye cabecera de la clinica, datos del paciente, tabla de tratamientos y total.
 */
@Service
@RequiredArgsConstructor
public class PdfService {

    private final UserRepository userRepository;
    private final TreatmentRepository treatmentRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${app.clinic.name:Clinica Dental Alamillo}")
    private String clinicName;
    @Value("${app.clinic.address:Calle Alamillo, XX - Sevilla}")
    private String clinicAddress;
    @Value("${app.clinic.phone:622 92 69 03}")
    private String clinicPhone;
    @Value("${app.clinic.cif:B-XXXXXXXX}")
    private String clinicCif;

    private static final Color TEAL    = new Color(13, 148, 136);
    private static final Color TEAL_BG = new Color(240, 253, 250);
    private static final Color DARK    = new Color(17, 24, 39);
    private static final Color GRAY    = new Color(107, 114, 128);
    private static final Color GRAY_BG = new Color(249, 250, 251);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.of("es", "ES"));

    // ── Factura ───────────────────────────────────────────────────────────────

    @Transactional
    public byte[] generateInvoice(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + patientId));

        List<Treatment> treatments = treatmentRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(t -> t.getStatus() == Treatment.TreatmentStatus.COMPLETED)
                .toList();

        BigDecimal total = treatments.stream()
                .map(Treatment::getCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int year = LocalDateTime.now().getYear();
        Invoice invoice = invoiceRepository.save(
                Invoice.builder().patientId(patientId).totalAmount(total).invoiceYear(year).build()
        );

        return buildInvoicePdf(patient, treatments, invoice);
    }

    // ── Presupuesto ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] generateBudget(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + patientId));

        List<Treatment> treatments = treatmentRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(t -> t.getStatus() != Treatment.TreatmentStatus.CANCELLED)
                .toList();

        return buildPdf(patient, treatments);
    }

    private byte[] buildPdf(User patient, List<Treatment> treatments) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, TEAL);
            Font h2Font     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, DARK);
            Font labelFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  GRAY);
            Font valueFont  = FontFactory.getFont(FontFactory.HELVETICA, 10, DARK);
            Font tableHead  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  Color.WHITE);
            Font tableBody  = FontFactory.getFont(FontFactory.HELVETICA, 9,  DARK);
            Font totalFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, TEAL);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8,  GRAY);

            // Cabecera
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{3, 1});
            header.setSpacingAfter(16);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.addElement(new Paragraph(clinicName, titleFont));
            logoCell.addElement(new Paragraph(clinicAddress,
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            logoCell.addElement(new Paragraph("Tel: " + clinicPhone + "  CIF: " + clinicCif,
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            header.addCell(logoCell);

            PdfPCell docCell = new PdfPCell();
            docCell.setBorder(Rectangle.NO_BORDER);
            docCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            docCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            docCell.addElement(new Paragraph("PRESUPUESTO",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, TEAL)));
            docCell.addElement(new Paragraph("Fecha: " + LocalDate.now().format(DATE_FMT),
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            header.addCell(docCell);
            doc.add(header);

            // Separador horizontal
            doc.add(new Chunk(new LineSeparator(1f, 100f, TEAL, Element.ALIGN_CENTER, -2f)));
            doc.add(new Paragraph(" "));

            // Datos del paciente
            Paragraph patientTitle = new Paragraph("Datos del paciente", h2Font);
            patientTitle.setSpacingBefore(6);
            patientTitle.setSpacingAfter(8);
            doc.add(patientTitle);

            PdfPTable patientInfo = new PdfPTable(4);
            patientInfo.setWidthPercentage(100);
            patientInfo.setSpacingAfter(20);
            addInfoCell(patientInfo, "Nombre",       patient.getFullName(),                                   labelFont, valueFont);
            addInfoCell(patientInfo, "Email",        patient.getEmail(),                                      labelFont, valueFont);
            addInfoCell(patientInfo, "Telefono",     patient.getPhone() != null ? patient.getPhone() : "-",  labelFont, valueFont);
            addInfoCell(patientInfo, "N Paciente",   "#" + patient.getId(),                                   labelFont, valueFont);
            doc.add(patientInfo);

            // Tabla de tratamientos
            Paragraph treatTitle = new Paragraph("Tratamientos / Prestaciones", h2Font);
            treatTitle.setSpacingAfter(8);
            doc.add(treatTitle);

            if (treatments.isEmpty()) {
                doc.add(new Paragraph("No hay tratamientos registrados.", valueFont));
            } else {
                PdfPTable table = new PdfPTable(new float[]{0.5f, 3f, 1.5f, 1.2f, 1.2f});
                table.setWidthPercentage(100);
                table.setSpacingAfter(16);

                for (String col : new String[]{"#", "Tratamiento", "Estado", "Pieza", "Coste"}) {
                    PdfPCell cell = new PdfPCell(new Phrase(col, tableHead));
                    cell.setBackgroundColor(TEAL);
                    cell.setPadding(7);
                    cell.setBorder(Rectangle.NO_BORDER);
                    table.addCell(cell);
                }

                BigDecimal total = BigDecimal.ZERO;
                int idx = 1;
                for (Treatment t : treatments) {
                    Color bg = (idx % 2 == 0) ? GRAY_BG : Color.WHITE;
                    String desc = t.getName() +
                            (t.getDescription() != null ? "\n" + t.getDescription() : "");
                    String pieza = t.getToothRecord() != null
                            ? "FDI " + t.getToothRecord().getToothNumber() : "-";
                    String cost = t.getCost() != null ? t.getCost() + " EUR" : "-";

                    addTableCell(table, String.valueOf(idx++), tableBody, bg, Element.ALIGN_CENTER);
                    addTableCell(table, desc,                  tableBody, bg, Element.ALIGN_LEFT);
                    addTableCell(table, translateStatus(t.getStatus()), tableBody, bg, Element.ALIGN_CENTER);
                    addTableCell(table, pieza,                 tableBody, bg, Element.ALIGN_CENTER);
                    addTableCell(table, cost,                  tableBody, bg, Element.ALIGN_RIGHT);
                    if (t.getCost() != null) total = total.add(t.getCost());
                }

                // Fila total
                PdfPCell empty = new PdfPCell(new Phrase(""));
                empty.setColspan(3);
                empty.setBorder(Rectangle.TOP);
                empty.setBorderColor(TEAL);
                empty.setPadding(6);
                table.addCell(empty);

                PdfPCell lblTotal = new PdfPCell(new Phrase("TOTAL", totalFont));
                lblTotal.setBackgroundColor(TEAL_BG);
                lblTotal.setBorder(Rectangle.TOP);
                lblTotal.setBorderColor(TEAL);
                lblTotal.setPadding(6);
                lblTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(lblTotal);

                PdfPCell valTotal = new PdfPCell(new Phrase(total + " EUR", totalFont));
                valTotal.setBackgroundColor(TEAL_BG);
                valTotal.setBorder(Rectangle.TOP);
                valTotal.setBorderColor(TEAL);
                valTotal.setPadding(6);
                valTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(valTotal);

                doc.add(table);
            }

            // Nota legal
            Paragraph legal = new Paragraph(
                    "Presupuesto valido 30 dias desde la emision. " +
                    "Precios incluyen IVA cuando corresponda. " +
                    "Documento generado electronicamente.",
                    footerFont);
            legal.setSpacingBefore(20);
            legal.setAlignment(Element.ALIGN_CENTER);
            doc.add(legal);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font lf, Font vf) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(TEAL_BG);
        cell.setPadding(8);
        cell.addElement(new Phrase(label, lf));
        cell.addElement(new Phrase(value != null ? value : "-", vf));
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private String translateStatus(Treatment.TreatmentStatus s) {
        return switch (s) {
            case PLANNED     -> "Planificado";
            case IN_PROGRESS -> "En curso";
            case COMPLETED   -> "Completado";
            case CANCELLED   -> "Cancelado";
        };
    }

    // ── PDF de factura ────────────────────────────────────────────────────────

    private byte[] buildInvoicePdf(User patient, List<Treatment> treatments, Invoice invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, TEAL);
            Font h2Font     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, DARK);
            Font labelFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  GRAY);
            Font valueFont  = FontFactory.getFont(FontFactory.HELVETICA, 10, DARK);
            Font tableHead  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,  Color.WHITE);
            Font tableBody  = FontFactory.getFont(FontFactory.HELVETICA, 9,  DARK);
            Font totalFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, TEAL);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8,  GRAY);
            Font exemptFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, GRAY);

            // Cabecera emisor + datos factura
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{3, 1.8f});
            header.setSpacingAfter(16);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.addElement(new Paragraph(clinicName, titleFont));
            logoCell.addElement(new Paragraph(clinicAddress,
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            logoCell.addElement(new Paragraph("Tel: " + clinicPhone + "  CIF: " + clinicCif,
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            header.addCell(logoCell);

            PdfPCell docCell = new PdfPCell();
            docCell.setBorder(Rectangle.NO_BORDER);
            docCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(new Paragraph("FACTURA",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, TEAL)));
            docCell.addElement(new Paragraph(invoice.getInvoiceNumber(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK)));
            docCell.addElement(new Paragraph("Fecha: " + invoice.getGeneratedAt().toLocalDate().format(DATE_FMT),
                    FontFactory.getFont(FontFactory.HELVETICA, 9, GRAY)));
            header.addCell(docCell);
            doc.add(header);

            doc.add(new Chunk(new LineSeparator(1f, 100f, TEAL, Element.ALIGN_CENTER, -2f)));
            doc.add(new Paragraph(" "));

            // Datos del paciente (receptor)
            Paragraph recTitle = new Paragraph("Datos del paciente", h2Font);
            recTitle.setSpacingBefore(6);
            recTitle.setSpacingAfter(8);
            doc.add(recTitle);

            PdfPTable patientInfo = new PdfPTable(4);
            patientInfo.setWidthPercentage(100);
            patientInfo.setSpacingAfter(20);
            addInfoCell(patientInfo, "Nombre",     patient.getFullName(),                                  labelFont, valueFont);
            addInfoCell(patientInfo, "Email",       patient.getEmail(),                                     labelFont, valueFont);
            addInfoCell(patientInfo, "Telefono",    patient.getPhone() != null ? patient.getPhone() : "-", labelFont, valueFont);
            addInfoCell(patientInfo, "N Paciente",  "#" + patient.getId(),                                  labelFont, valueFont);
            doc.add(patientInfo);

            // Tabla de tratamientos completados
            Paragraph treatTitle = new Paragraph("Servicios prestados", h2Font);
            treatTitle.setSpacingAfter(8);
            doc.add(treatTitle);

            if (treatments.isEmpty()) {
                doc.add(new Paragraph("No hay tratamientos completados para facturar.", valueFont));
            } else {
                PdfPTable table = new PdfPTable(new float[]{0.5f, 3.5f, 1.2f, 1.2f});
                table.setWidthPercentage(100);
                table.setSpacingAfter(8);

                for (String col : new String[]{"#", "Descripcion", "Pieza", "Importe"}) {
                    PdfPCell cell = new PdfPCell(new Phrase(col, tableHead));
                    cell.setBackgroundColor(TEAL);
                    cell.setPadding(7);
                    cell.setBorder(Rectangle.NO_BORDER);
                    table.addCell(cell);
                }

                BigDecimal total = BigDecimal.ZERO;
                int idx = 1;
                for (Treatment t : treatments) {
                    Color bg = (idx % 2 == 0) ? GRAY_BG : Color.WHITE;
                    String desc = t.getName() + (t.getDescription() != null ? " - " + t.getDescription() : "");
                    String pieza = t.getToothRecord() != null ? "FDI " + t.getToothRecord().getToothNumber() : "-";
                    String cost  = t.getCost() != null ? t.getCost() + " EUR" : "-";

                    addTableCell(table, String.valueOf(idx++), tableBody, bg, Element.ALIGN_CENTER);
                    addTableCell(table, desc,  tableBody, bg, Element.ALIGN_LEFT);
                    addTableCell(table, pieza, tableBody, bg, Element.ALIGN_CENTER);
                    addTableCell(table, cost,  tableBody, bg, Element.ALIGN_RIGHT);
                    if (t.getCost() != null) total = total.add(t.getCost());
                }

                // Fila base imponible
                PdfPCell emptyBase = new PdfPCell(new Phrase(""));
                emptyBase.setColspan(2);
                emptyBase.setBorder(Rectangle.TOP);
                emptyBase.setBorderColor(TEAL);
                emptyBase.setPadding(6);
                table.addCell(emptyBase);

                PdfPCell lblBase = new PdfPCell(new Phrase("Base imponible", labelFont));
                lblBase.setBackgroundColor(TEAL_BG);
                lblBase.setBorder(Rectangle.TOP);
                lblBase.setBorderColor(TEAL);
                lblBase.setPadding(6);
                lblBase.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(lblBase);

                PdfPCell valBase = new PdfPCell(new Phrase(total + " EUR", tableBody));
                valBase.setBackgroundColor(TEAL_BG);
                valBase.setBorder(Rectangle.TOP);
                valBase.setBorderColor(TEAL);
                valBase.setPadding(6);
                valBase.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(valBase);

                // Fila IVA exento
                PdfPCell emptyIva = new PdfPCell(new Phrase(""));
                emptyIva.setColspan(2);
                emptyIva.setBorder(Rectangle.NO_BORDER);
                emptyIva.setPadding(6);
                table.addCell(emptyIva);

                PdfPCell lblIva = new PdfPCell(new Phrase("IVA (exento)", labelFont));
                lblIva.setBackgroundColor(TEAL_BG);
                lblIva.setBorder(Rectangle.NO_BORDER);
                lblIva.setPadding(6);
                lblIva.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(lblIva);

                PdfPCell valIva = new PdfPCell(new Phrase("0,00 EUR", tableBody));
                valIva.setBackgroundColor(TEAL_BG);
                valIva.setBorder(Rectangle.NO_BORDER);
                valIva.setPadding(6);
                valIva.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(valIva);

                // Fila total
                PdfPCell emptyTotal = new PdfPCell(new Phrase(""));
                emptyTotal.setColspan(2);
                emptyTotal.setBorder(Rectangle.NO_BORDER);
                emptyTotal.setPadding(6);
                table.addCell(emptyTotal);

                PdfPCell lblTotal = new PdfPCell(new Phrase("TOTAL A PAGAR", totalFont));
                lblTotal.setBackgroundColor(TEAL_BG);
                lblTotal.setBorder(Rectangle.NO_BORDER);
                lblTotal.setPadding(6);
                lblTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(lblTotal);

                PdfPCell valTotal = new PdfPCell(new Phrase(total + " EUR", totalFont));
                valTotal.setBackgroundColor(TEAL_BG);
                valTotal.setBorder(Rectangle.NO_BORDER);
                valTotal.setPadding(6);
                valTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(valTotal);

                doc.add(table);
            }

            // Nota exencion IVA
            Paragraph ivaNote = new Paragraph(
                    "Operacion exenta de IVA en virtud del articulo 20.Uno.3 de la Ley 37/1992 " +
                    "(servicios de asistencia dental).",
                    exemptFont);
            ivaNote.setSpacingBefore(4);
            ivaNote.setAlignment(Element.ALIGN_LEFT);
            doc.add(ivaNote);

            // Pie legal
            Paragraph legal = new Paragraph(
                    "Factura emitida electronicamente conforme al Real Decreto 1619/2012. " +
                    "Conserve este documento a efectos fiscales.",
                    footerFont);
            legal.setSpacingBefore(16);
            legal.setAlignment(Element.ALIGN_CENTER);
            doc.add(legal);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando factura PDF: " + e.getMessage(), e);
        }
    }
}
