package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.DentalServiceRequest;
import com.clinicaalamillo.model.DentalService;
import com.clinicaalamillo.service.DentalServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Servicios", description = "Catálogo de tratamientos dentales")
public class ServiceController {

    private final DentalServiceService dentalServiceService;

    @GetMapping
    @Operation(summary = "Listar servicios activos", description = "Devuelve los tratamientos visibles en el formulario de citas.")
    public ResponseEntity<List<DentalService>> findAll() {
        return ResponseEntity.ok(dentalServiceService.findAllActive());
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos los servicios (admin)", description = "Incluye servicios inactivos. Uso exclusivo del panel de gestión.")
    public ResponseEntity<List<DentalService>> findAllIncludingInactive() {
        return ResponseEntity.ok(dentalServiceService.findAll());
    }

    @PostMapping
    @Operation(
        summary = "Crear un nuevo servicio",
        description = "Añade un tratamiento al catálogo.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Servicio creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
        }
    )
    public ResponseEntity<DentalService> create(@Valid @RequestBody DentalServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dentalServiceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Actualizar un servicio",
        description = "Edita nombre, descripción, precio, duración y estado activo/inactivo.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Servicio actualizado"),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
        }
    )
    public ResponseEntity<DentalService> update(
            @PathVariable Long id,
            @Valid @RequestBody DentalServiceRequest request) {
        return ResponseEntity.ok(dentalServiceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar un servicio",
        description = "Elimina el servicio permanentemente. Para ocultarlo sin borrar, usa el campo 'active: false'.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Eliminado"),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
        }
    )
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dentalServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
