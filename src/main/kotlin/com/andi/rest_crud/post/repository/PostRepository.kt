package com.andi.rest_crud.post.repository

import com.andi.rest_crud.post.domain.PostEntity
import org.springframework.data.jpa.repository.JpaRepository

interface PostRepository : JpaRepository<PostEntity, Long>
