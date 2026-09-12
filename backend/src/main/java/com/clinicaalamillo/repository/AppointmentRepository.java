package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDateOrderByTimeAsc(LocalDate date);

    @Query("SELECT a.time FROM Appointment a WHERE a.date = :date AND a.status <> 'CANCELLED'")
    List<LocalTime> findBookedTimesByDate(@Param("date") LocalDate date);

    boolean existsByDateAndTimeAndStatusNot(LocalDate date, LocalTime time, Appointment.AppointmentStatus status);

    List<Appointment> findByEmailOrderByDateDescTimeDesc(String email);

    /** Para la agenda Kanban: citas en un rango de fechas. */
    @Query("SELECT a FROM Appointment a WHERE a.date BETWEEN :from AND :to ORDER BY a.date ASC, a.time ASC")
    List<Appointment> findByDateRangeOrdered(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
