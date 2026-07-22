package com.andi.rest_crud.support

import com.andi.rest_crud.auth.dto.LoginRequest
import com.andi.rest_crud.post.domain.PostEntity
import com.andi.rest_crud.post.dto.PostCreateRequest
import com.andi.rest_crud.user.domain.User

object TestFixtureFactory {
    fun postCreateRequest(
        title: String = "테스트 제목",
        content: String = "테스트 내용"
    ): PostCreateRequest = PostCreateRequest(
        title = title,
        content = content
    )

    fun postEntity(
        id: Long = 1L,
        title: String = "테스트 제목",
        content: String = "테스트 내용",
        author: String = "tester@example.com"
    ): PostEntity = PostEntity(
        id = id,
        title = title,
        content = content,
        author = author
    )

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
        password: String = "encoded-password"
    ): User = User(
        id = id,
        email = email,
        password = password
    )
}
