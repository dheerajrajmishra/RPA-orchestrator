package com.rpa.backend.controller;

import com.rpa.backend.entity.Category;
import com.rpa.backend.entity.VmHost;
import com.rpa.backend.repository.CategoryRepository;
import com.rpa.backend.repository.VmHostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;
    private final VmHostRepository vmHostRepository;

    @GetMapping
    public Object getAllCategories(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            return categoryRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("name").ascending()));
        }
        return categoryRepository.findAll();
    }

    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable UUID id, @RequestBody Category details) {
        return categoryRepository.findById(id).map(c -> {
            String oldName = c.getName();
            String newName = details.getName();

            c.setName(newName);
            c.setDescription(details.getDescription());
            if (details.getColor() != null) {
                c.setColor(details.getColor());
            }

            Category savedCategory = categoryRepository.save(c);

            // Cascade update host categories if category name changed
            if (oldName != null && !oldName.equals(newName)) {
                List<VmHost> hosts = vmHostRepository.findByCategory(oldName);
                for (VmHost host : hosts) {
                    host.setCategory(newName);
                    vmHostRepository.save(host);
                }
            }

            return savedCategory;
        }).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable UUID id) {
        categoryRepository.deleteById(id);
    }
}

