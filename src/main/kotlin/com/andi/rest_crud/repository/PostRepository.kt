package com.andi.rest_crud.repository

import com.andi.rest_crud.domain.PostEntity
import org.springframework.data.jpa.repository.JpaRepository

// TODO(A&I) 1. PostEntity를 저장할 Repository 인터페이스를 확인하세요.
// TODO(A&I) 2. JpaRepository<PostEntity, Long>를 상속하세요.
// TODO(A&I) 3. 구현 클래스를 직접 만들지 않아도 기본 CRUD 메서드를 쓸 수 있다는 점을 기억하세요.
interface PostRepository : JpaRepository<PostEntity, Long>
