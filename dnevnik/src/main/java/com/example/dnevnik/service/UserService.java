package com.example.dnevnik.service;

import com.example.dnevnik.model.User;
import com.example.dnevnik.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean register(String login, String password) {
        if (userRepository.findByLogin(login).isPresent()) {
            return false;
        }
        userRepository.save(new User(login, password));
        return true;
    }

    public User authenticate(String login, String password) {
        Optional<User> userOpt = userRepository.findByLogin(login);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }
        return null;
    }
}