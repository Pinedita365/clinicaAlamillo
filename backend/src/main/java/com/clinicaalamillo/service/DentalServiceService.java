package com.clinicaalamillo.service;

import com.clinicaalamillo.dto.DentalServiceRequest;
import com.clinicaalamillo.model.DentalService;
import com.clinicaalamillo.repository.DentalServiceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DentalServiceService {

    private final DentalServiceRepository dentalServiceRepository;

    @Transactional(readOnly = true)
    public List<DentalService> findAllActive() {
        return dentalServiceRepository.findByActiveTrueOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public List<DentalService> findAll() {
        return dentalServiceRepository.findAll();
    }

    @Transactional
    public DentalService create(DentalServiceRequest req) {
        DentalService svc = DentalService.builder()
                .name(req.getName())
                .description(req.getDescription())
                .duration(req.getDuration())
                .priceRange(req.getPriceRange())
                .iconKey(req.getIconKey())
                .active(req.isActive())
                .build();
        return dentalServiceRepository.save(svc);
    }

    @Transactional
    public DentalService update(Long id, DentalServiceRequest req) {
        DentalService svc = dentalServiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado: " + id));

        svc.setName(req.getName());
        svc.setDescription(req.getDescription());
        svc.setDuration(req.getDuration());
        svc.setPriceRange(req.getPriceRange());
        svc.setIconKey(req.getIconKey());
        svc.setActive(req.isActive());

        return dentalServiceRepository.save(svc);
    }

    @Transactional
    public void delete(Long id) {
        if (!dentalServiceRepository.existsById(id)) {
            throw new EntityNotFoundException("Servicio no encontrado: " + id);
        }
        dentalServiceRepository.deleteById(id);
    }
}
