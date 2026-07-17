/*
 * 실습 순서 08 — 게시글 소유권 인가
 * 선행 단계: Step03의 author, Step04의 403/404 예외, Step07이 전달한 인증 email을 사용합니다.
 * 이 단계의 판단: Authentication으로 확인한 신원과 저장된 작성자가 같은지 변경 전에 비교합니다.
 * 완료 상태: 인증과 별개로 실제 작업 권한을 판단하면서 signup부터 ownership까지 한 흐름이 닫힙니다.
 */
package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.exception.ForbiddenPostAccessException
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class PostService(
    private val postRepository: PostRepository
) {

    @Transactional
    fun create(request: PostCreateRequest, authorEmail: String): PostResponse {
        // 작성자를 body에서 받지 않고 검증된 principal에서만 받아 다른 사용자를 사칭하지 못하게 합니다.
        val savedPost = postRepository.save(
            PostEntity(
                title = request.title,
                content = request.content,
                author = authorEmail
            )
        )

        return PostResponse.from(savedPost)
    }

    fun getAll(): List<PostResponse> {
        return postRepository.findAll()
            .map(PostResponse::from)
    }

    fun getById(id: Long): PostResponse {
        return PostResponse.from(findPostById(id))
    }

    @Transactional
    fun update(id: Long, request: PostUpdateRequest, currentUserEmail: String): PostResponse {
        val post = findPostById(id)
        // 값을 바꾸기 전에 작성자를 확인해야 다른 사용자의 게시글이 transaction 안에서 수정되지 않습니다.
        validateAuthor(post, currentUserEmail)
        post.update(request.title, request.content)
        // 쓰기 transaction의 dirty checking이 변경을 반영하므로 repository.save를 다시 호출하지 않습니다.

        return PostResponse.from(post)
    }

    @Transactional
    fun delete(id: Long, currentUserEmail: String) {
        val post = findPostById(id)
        // 삭제도 수정과 같은 소유권 경계를 지나야 인증만 된 다른 사용자의 접근을 403으로 막습니다.
        validateAuthor(post, currentUserEmail)
        postRepository.delete(post)
    }

    // 조회 경로를 한곳에 모아 get/update/delete가 같은 404 규칙을 사용합니다.
    private fun findPostById(id: Long): PostEntity {
        return postRepository.findById(id)
            .orElseThrow { PostNotFoundException(id) }
    }

    private fun validateAuthor(post: PostEntity, currentUserEmail: String) {
        // Authentication은 신원만 증명하므로 실제 작업 권한은 저장된 작성자와 별도로 비교합니다.
        if (!post.isWrittenBy(currentUserEmail)) {
            throw ForbiddenPostAccessException(post.id)
        }
    }
}
