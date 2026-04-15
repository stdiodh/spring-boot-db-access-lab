package com.andi.rest_crud.repository

import com.andi.rest_crud.model.Idol
import org.springframework.data.jpa.repository.JpaRepository

interface IdolRepository : JpaRepository<Idol, Long>
