package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service

@Service
class PostService(
    private val postRepository: PostRepository
) {

    // TODO(A&I) 1. request 값으로 PostEntity를 만드세요.
    // TODO(A&I) 2. 이제는 메모리 리스트가 아니라 postRepository.save(...)를 호출하세요.
    // TODO(A&I) 3. 저장 결과를 PostResponse.from(...)으로 변환하세요.
    fun create(request: PostCreateRequest): PostResponse {
        TODO("DB 저장 흐름으로 create를 완성하세요.")
    }

    // TODO(A&I) 1. postRepository.findAll()을 호출하세요.
    // TODO(A&I) 2. 각 Entity를 PostResponse로 변환하세요.
    fun getAll(): List<PostResponse> {
        TODO("DB 전체 조회 흐름으로 getAll을 완성하세요.")
    }

    // TODO(A&I) 1. postRepository.findById(id)를 사용하세요.
    // TODO(A&I) 2. 조회 결과를 PostResponse로 변환하세요.
    // TODO(A&I) 3. 이번 시퀀스는 정상 흐름이 먼저이므로 단건 조회 흐름이 보이게 작성하세요.
    fun getById(id: Long): PostResponse {
        TODO("DB 단건 조회 흐름으로 getById를 완성하세요.")
    }

    // TODO(A&I) 1. id로 기존 Entity를 조회하세요.
    // TODO(A&I) 2. title, content, author 값을 수정하세요.
    // TODO(A&I) 3. save(...) 후 PostResponse로 변환하세요.
    fun update(id: Long, request: PostUpdateRequest): PostResponse {
        TODO("DB 수정 흐름으로 update를 완성하세요.")
    }

    // TODO(A&I) 1. deleteById(id)를 사용하거나 조회 후 삭제하세요.
    // TODO(A&I) 2. 삭제 후 Swagger와 MySQL 조회 결과를 확인하세요.
    fun delete(id: Long) {
        TODO("DB 삭제 흐름으로 delete를 완성하세요.")
    }
}
