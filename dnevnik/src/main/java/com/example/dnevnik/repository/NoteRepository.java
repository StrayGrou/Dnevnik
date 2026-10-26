package com.example.dnevnik.repository;

import com.example.dnevnik.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Note> findByUserIdAndMoodOrderByCreatedAtDesc(Long userId, String mood);
    Optional<Note> findByIdAndUserId(Long id, Long userId);
}