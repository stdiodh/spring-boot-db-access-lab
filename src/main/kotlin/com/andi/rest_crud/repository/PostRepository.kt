package com.andi.rest_crud.repository

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostResponse
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

/*
 * TODO(A&I)
 *
 * 1. PostEntity를 import하세요.
 * 2. JpaRepository를 import하세요.
 * 3. PostEntity를 저장할 Repository 인터페이스를 선언하세요.
 * 4. 기본 키 타입은 Long을 사용하세요.
 *
 * 목표 형태:
 * - PostEntity를 대상으로 하는 JPA Repository
 * - id 타입은 Long
 */
interface PostRepository : JpaRepository<PostEntity, Long>

