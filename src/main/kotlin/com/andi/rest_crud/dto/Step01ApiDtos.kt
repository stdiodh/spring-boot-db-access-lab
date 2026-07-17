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
    // 요청 본문 검증은 Kotlin backing field에 적용해야 잘못된 email이 Service까지 들어오지 않습니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 가입 시점에 저장 가능한 비밀번호 범위를 확정하되 원문의 공백은 사용자 입력으로 보존합니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "password는 8자 이상 64자 이하여야 합니다.")
    val password: String
)

data class LoginRequest(
    // 회원가입과 로그인에 같은 email 계약을 사용해야 같은 계정을 일관되게 찾을 수 있습니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 로그인은 신규 비밀번호 정책이 아니라 저장된 값과의 일치를 확인하므로 최대 길이만 제한합니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(max = 64, message = "password는 64자 이하여야 합니다.")
    val password: String
)

data class PostCreateRequest(
    // API가 허용한 제목이 DB 컬럼에서 잘리지 않도록 두 계층의 최대 길이를 맞춥니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 본문은 공백뿐인 요청을 막고 실제 저장 가능한 범위 안에서만 받습니다.
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

data class PostUpdateRequest(
    // 생성과 수정의 제목 계약이 같아야 저장된 게시글의 유효성이 작업마다 달라지지 않습니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 수정 요청도 생성과 같은 본문 범위를 지켜 기존 데이터를 잘못된 상태로 만들지 않습니다.
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
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
