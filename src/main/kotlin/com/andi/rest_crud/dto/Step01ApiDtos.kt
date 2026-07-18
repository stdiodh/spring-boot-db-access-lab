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
    // 실습 빈칸 대응: 가입 email은 요청 경계에서 유효한 값만 받습니다.
    // 설명 포인트: Kotlin에서는 Validation이 backing field에 적용되도록 대상을 명시합니다.
    // 확인 질문: 대상 지정이 빠지면 이 검증은 실제 요청에서 동작할까요?
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 실습 빈칸 대응: 가입 password는 저장 가능한 입력 범위를 지킵니다.
    // 설명 포인트: 앞뒤 공백도 자격 정보의 일부이므로 원문을 임의로 바꾸지 않습니다.
    // 확인 질문: 가입 때 password를 trim하면 로그인에는 어떤 영향이 생길까요?
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "password는 8자 이상 64자 이하여야 합니다.")
    val password: String
)

data class LoginRequest(
    // 실습 빈칸 대응: 로그인 email도 가입과 같은 입력 계약을 사용합니다.
    // 설명 포인트: 같은 식별자는 진입 API가 달라도 같은 규칙으로 해석해야 합니다.
    // 확인 질문: 가입과 로그인의 email 규칙이 다르면 어떤 계정을 찾지 못할 수 있을까요?
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 실습 빈칸 대응: 로그인 password는 비교 가능한 요청인지 먼저 검증합니다.
    // 설명 포인트: 로그인은 신규 password 정책보다 저장된 자격 정보와의 일치가 핵심입니다.
    // 확인 질문: 가입과 로그인에 같은 최소 길이 규칙이 꼭 필요할까요?
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(max = 64, message = "password는 64자 이하여야 합니다.")
    val password: String
)

data class PostCreateRequest(
    // 실습 빈칸 대응: 새 글 title은 저장 계약 안의 값만 허용합니다.
    // 설명 포인트: 요청 최대 길이와 DB 컬럼 길이는 같은 기준을 가리켜야 합니다.
    // 확인 질문: API만 길이를 검사하고 DB 길이가 더 짧으면 어디에서 실패할까요?
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 실습 빈칸 대응: 새 글 content는 의미 있는 저장 범위 안에서 받습니다.
    // 설명 포인트: 공백뿐인 입력과 저장 한도를 넘는 입력은 서로 다른 검증 실패입니다.
    // 확인 질문: 빈 문자열과 5001자 본문은 같은 제약에 걸릴까요?
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

data class PostUpdateRequest(
    // 실습 빈칸 대응: 수정 title도 생성과 같은 유효 범위를 유지합니다.
    // 설명 포인트: 같은 데이터의 유효성이 생성과 수정 작업에 따라 달라지면 안 됩니다.
    // 확인 질문: 수정 API만 빈 title을 허용하면 저장 상태는 어떻게 달라질까요?
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 실습 빈칸 대응: 수정 content도 생성과 같은 저장 범위를 지킵니다.
    // 설명 포인트: 기존 데이터 변경도 최초 저장과 동일한 불변 조건을 통과해야 합니다.
    // 확인 질문: 생성 검증만 있고 수정 검증이 없다면 어떤 우회가 가능할까요?
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
