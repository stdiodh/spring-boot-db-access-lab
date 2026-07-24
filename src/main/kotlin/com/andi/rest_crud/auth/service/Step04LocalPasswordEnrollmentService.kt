/*
 * 실습 순서 04 — OAuth 계정의 선택적 LOCAL 비밀번호 등록
 * 선행 단계: Step03에서 Google identity를 내부 계정과 JWT로 연결합니다.
 * 이 단계의 판단: 검증된 JWT principal의 GOOGLE 계정에만 LOCAL 비밀번호를 한 번 등록합니다.
 * 다음 연결: Step05의 계정 복구가 localPasswordEnabled 상태를 기준으로 reset 가능 여부를 판단합니다.
 */
package com.andi.rest_crud.auth.service

import com.andi.rest_crud.auth.dto.LocalPasswordEnrollmentRequest
import com.andi.rest_crud.auth.exception.InvalidCredentialsException
import com.andi.rest_crud.auth.exception.LocalPasswordEnrollmentConflictException
import com.andi.rest_crud.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Locale

@Service
@Transactional(readOnly = true)
class LocalPasswordEnrollmentService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional
    fun enroll(principalEmail: String, request: LocalPasswordEnrollmentRequest) {
        val normalizedEmail = principalEmail.lowercase(Locale.ROOT)
        val user = userRepository.findByEmailForUpdate(normalizedEmail)
            .orElseThrow(::InvalidCredentialsException)

        // provider identity를 LOCAL로 덮어쓰면 다음 Google callback에서 기존 계정을 다시 찾을 수 없습니다.
        if (user.authProvider != GOOGLE_PROVIDER || user.localPasswordEnabled) {
            throw LocalPasswordEnrollmentConflictException()
        }

        user.password = requireNotNull(passwordEncoder.encode(request.newPassword))
        user.localPasswordEnabled = true
        userRepository.saveAndFlush(user)
    }

    private companion object {
        const val GOOGLE_PROVIDER = "GOOGLE"
    }
}
