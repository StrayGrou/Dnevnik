package com.example.dnevnik.service;

import com.example.dnevnik.model.Note;
import com.example.dnevnik.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getNotesForUser(Long userId, String mood) {
        if (mood != null && !mood.isBlank()) {
            return noteRepository.findByUserIdAndMoodOrderByCreatedAtDesc(userId, mood);
        }
        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Note> getNoteForUser(Long id, Long userId) {
        return noteRepository.findByIdAndUserId(id, userId);
    }

    public void saveNote(Note note) {
        noteRepository.save(note);
    }

    public void deleteNoteIfOwned(Long id, Long userId) {
        noteRepository.findByIdAndUserId(id, userId).ifPresent(noteRepository::delete);
    }
}