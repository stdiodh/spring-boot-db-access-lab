/*
 * 실습 순서 06 — 회원가입·로그인 서비스
 * 선행 단계: Step01 요청 계약, Step02 DB 제약, Step04 예외, Step05 JwtTokenProvider를 사용합니다.
 * 이 단계의 판단: email 정규화·BCrypt·unique 경쟁 처리는 가입에, 자격 증명 확인·token 발급은 로그인에 둡니다.
 * 다음 연결: 발급된 token은 Step05 Filter를 지나 Step07의 보호 API에서 현재 사용자 신원이 됩니다.
 */
package com.andi.rest_crud.service

import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.exception.UserAlreadyExistsException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Locale

@Service
// 조회가 기본이므로 readOnly로 두고, 계정을 저장하는 signUp만 쓰기 transaction으로 덮어씁니다.
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Transactional
    fun signUp(request: UserSignUpRequest) {
        // TODO(Auth) email 정규화, 중복 사전 확인, BCrypt encode, unique 경쟁 변환을 연결하세요.
        TODO("회원가입 저장 흐름을 완성하세요.")
    }

    fun login(request: LoginRequest): TokenResponse {
        // TODO(Auth) 같은 email 정규화와 원문 password 비교 뒤 accessToken/만료 정보를 반환하세요.
        TODO("로그인 흐름을 완성하세요.")
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        // TODO(Auth) Filter가 만든 principal email을 정규화해 현재 사용자를 조회하세요.
        TODO("현재 사용자 조회 흐름을 완성하세요.")
    }

    // Locale.ROOT를 사용해야 서버 언어 설정과 무관하게 같은 email 정규화 결과를 얻습니다.
    private fun normalizeEmail(email: String): String = email.lowercase(Locale.ROOT)

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
