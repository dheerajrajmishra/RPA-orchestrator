package com.rpa.backend.security;

import com.rpa.backend.entity.User;
import com.rpa.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + usernameOrEmail));
        
        var authorities = user.getRole() != null && user.getRole().getPermissions() != null
                ? user.getRole().getPermissions().stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
                : Collections.<SimpleGrantedAuthority>emptyList();
                
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPasswordHash() != null ? user.getPasswordHash() : "", authorities);
    }
}
