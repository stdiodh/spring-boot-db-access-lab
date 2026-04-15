package com.andi.rest_crud.controller

import com.andi.rest_crud.dto.IdolRequest
import com.andi.rest_crud.dto.IdolResponse
import com.andi.rest_crud.service.IdolService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/idols")
class IdolController(
    private val idolService: IdolService
) {

    // GET /idols
    @GetMapping
    fun getAll(): List<IdolResponse> {
        return idolService.getAll()
    }

    // GET /idols/{id}
    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): IdolResponse {
        return idolService.getById(id)
    }

    // POST /idols
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: IdolRequest): IdolResponse {
        return idolService.create(request)
    }

    // PUT /idols/{id}
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: IdolRequest): IdolResponse {
        return idolService.update(id, request)
    }

    // DELETE /idols/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        idolService.delete(id)
    }
}
