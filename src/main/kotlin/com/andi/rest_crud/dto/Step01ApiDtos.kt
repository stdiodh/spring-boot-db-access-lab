/*
 * 실습 순서 01 — API 입력·응답 계약
 * 선행 단계: 없음. 외부 요청이 애플리케이션 안으로 들어오는 첫 경계입니다.
 * 이 단계의 판단: @field: Validation으로 Service가 받아도 되는 값의 범위를 먼저 고정합니다.
 * 다음 연결: Step02/03의 DB column 길이와 Step04의 Validation 오류 응답이 이 계약을 그대로 따릅니다.
 */
package com.andi.rest_crud.dto

import com.andi.rest_crud.domain.PostEntity
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UserSignUpRequest(
    // TODO(Validation) email에 NotBlank, Email, 최대 254자 제약을 field 대상으로 적용하세요.
    val email: String,

    // TODO(Validation) password에 NotBlank와 8~64자 제약을 적용하고 원문을 trim하지 마세요.
    val password: String
)

data class LoginRequest(
    // TODO(Validation) 회원가입과 같은 email 제약을 적용하세요.
    val email: String,

    // TODO(Validation) 로그인 password에는 NotBlank와 최대 64자 제약만 적용하세요.
    val password: String
)

data class PostCreateRequest(
    // TODO(Validation) title에 NotBlank와 최대 100자 제약을 적용하세요.
    val title: String,

    // TODO(Validation) content에 NotBlank와 최대 5000자 제약을 적용하세요.
    val content: String
)

data class PostUpdateRequest(
    // TODO(Validation) 생성 요청과 같은 title 제약을 적용하세요.
    val title: String,

    // TODO(Validation) 생성 요청과 같은 content 제약을 적용하세요.
    val content: String
)

// 보호 API는 검증된 최소 신원만 반환해 JWT 내부 구조가 응답 계약으로 새지 않게 합니다.
data class CurrentUserResponse(
    val email: String
)

// 클라이언트가 JWT payload를 직접 해석하지 않도록 전달 방식과 남은 만료 시간을 함께 제공합니다.
// expiresIn은 내부 millisecond 설정을 그대로 노출하지 않고 HTTP 클라이언트가 바로 쓰기 쉬운 초 단위로 반환합니다.
data class TokenResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long
)

// 영속성 Entity 대신 응답 모델을 사용해 DB 변경 가능 상태가 API 경계 밖으로 노출되지 않게 합니다.
data class PostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val author: String
) {
    companion object {
        fun from(entity: PostEntity): PostResponse = PostResponse(
            id = entity.id,
            title = entity.title,
            content = entity.content,
            author = entity.author
        )
    }
}
