package com.andi.rest_crud.support

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.PostCreateRequest

object TestFixtureFactory {

    fun postCreateRequest(
        title: String = "테스트 제목",
        content: String = "테스트 내용",
        author: String = "tester"
    ): PostCreateRequest = PostCreateRequest(
        title = title,
        content = content,
        author = author
    )

    fun postEntity(
        id: Long = 1L,
        title: String = "테스트 제목",
        content: String = "테스트 내용",
        author: String = "tester"
    ): PostEntity {
        // TODO 1. 저장 후 repository가 돌려줄 게시글 Entity를 떠올려보세요.
        // TODO 2. id, title, content, author가 테스트 기대값과 연결되는지 확인하세요.
        return PostEntity(
            id = id,
            title = title,
            content = content,
            author = author
        )
    }

    fun loginRequest(
        email: String = "tester@example.com",
        password: String = "password123"
    ): LoginRequest = LoginRequest(
        email = email,
        password = password
    )

    fun user(
        id: Long = 1L,
        email: String = "tester@example.com",
        password: String = "encoded-password",
        authProvider: String = "LOCAL",
        providerId: String? = null
    ): User {
        // TODO 3. 로그인 성공/실패 테스트에서 어떤 email, password가 필요한지 먼저 생각해보세요.
        return User(
            id = id,
            email = email,
            password = password,
            authProvider = authProvider,
            providerId = providerId
        )
    }
}
