package com.example.dnevnik.controller;

import com.example.dnevnik.model.Note;
import com.example.dnevnik.model.User;
import com.example.dnevnik.service.NoteService;
import com.example.dnevnik.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class DiaryController {

    private final UserService userService;
    private final NoteService noteService;

    private static final List<String> MOODS = List.of("Отличное", "Хорошее", "Нормальное", "Плохое");

    public DiaryController(UserService userService, NoteService noteService) {
        this.userService = userService;
        this.noteService = noteService;
    }

    @GetMapping("/")
    public String index() {
        return "redirect:/notes";
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String login, @RequestParam String password, Model model) {
        if (!userService.register(login, password)) {
            model.addAttribute("error", "Пользователь с таким логином уже существует");
            return "register";
        }
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String loginUser(@RequestParam String login, @RequestParam String password, HttpSession session, Model model) {
        User user = userService.authenticate(login, password);
        if (user != null) {
            session.setAttribute("userId", user.getId());
            session.setAttribute("userLogin", user.getLogin());
            return "redirect:/notes";
        }
        model.addAttribute("error", "Неверный логин или пароль");
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }



    @GetMapping("/notes")
    public String listNotes(@RequestParam(required = false) String mood, HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return "redirect:/login";

        model.addAttribute("notes", noteService.getNotesForUser(userId, mood));
        model.addAttribute("moods", MOODS);
        model.addAttribute("selectedMood", mood);
        model.addAttribute("userLogin", session.getAttribute("userLogin"));
        return "notes";
    }

    @GetMapping("/notes/{id}")
    public String viewNote(@PathVariable Long id, HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return "redirect:/login";

        Optional<Note> noteOpt = noteService.getNoteForUser(id, userId);
        if (noteOpt.isEmpty()) return "redirect:/notes";

        model.addAttribute("note", noteOpt.get());
        return "note-view";
    }

    @GetMapping("/notes/new")
    public String showCreateForm(HttpSession session, Model model) {
        if (session.getAttribute("userId") == null) return "redirect:/login";

        model.addAttribute("note", new Note());
        model.addAttribute("moods", MOODS);
        return "note-form";
    }

    @GetMapping("/notes/{id}/edit")
    public String showEditForm(@PathVariable Long id, HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return "redirect:/login";

        Optional<Note> noteOpt = noteService.getNoteForUser(id, userId);
        if (noteOpt.isEmpty()) return "redirect:/notes";

        model.addAttribute("note", noteOpt.get());
        model.addAttribute("moods", MOODS);
        return "note-form";
    }

    @PostMapping("/notes/save")
    public String saveNote(@RequestParam(required = false) Long id, @RequestParam String title,
                           @RequestParam String content, @RequestParam String mood, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return "redirect:/login";

        Note note;
        if (id != null) {
            Optional<Note> existing = noteService.getNoteForUser(id, userId);
            if (existing.isEmpty()) return "redirect:/notes";
            note = existing.get();
        } else {
            note = new Note();
            note.setUserId(userId);
        }

        note.setTitle(title);
        note.setContent(content);
        note.setMood(mood);
        noteService.saveNote(note);

        return "redirect:/notes";
    }

    @PostMapping("/notes/{id}/delete")
    public String deleteNote(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId != null) {
            noteService.deleteNoteIfOwned(id, userId);
        }
        return "redirect:/notes";
    }
}