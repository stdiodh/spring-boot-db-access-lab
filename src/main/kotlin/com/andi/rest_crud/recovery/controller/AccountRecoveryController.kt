package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.dto.PasswordResetMailRequest
import com.andi.rest_crud.recovery.mail.RecoveryMailReadiness
import com.andi.rest_crud.recovery.service.AccountRecoveryService
import jakarta.validation.Valid
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/account-recovery")
class AccountRecoveryController(
    private val accountRecoveryService: AccountRecoveryService,
    private val recoveryMailReadiness: RecoveryMailReadiness
) {

    @PostMapping("/password-reset")
    fun requestPasswordReset(@Valid @RequestBody request: PasswordResetMailRequest): ResponseEntity<Void> {
        // 전역 SMTP 상태를 계정 조회보다 먼저 확인해 503/202 차이로 계정 존재 여부가 드러나지 않게 합니다.
        recoveryMailReadiness.ensureReady()
        // 사전검사 뒤에는 계정 존재 여부와 provider 종류를 구분하지 않고 같은 202를 반환합니다.
        accountRecoveryService.requestPasswordReset(request.email)
        return ResponseEntity.status(HttpStatus.ACCEPTED)
            .cacheControl(CacheControl.noStore())
            .build()
    }

    @PostMapping("/password-reset/confirm")
    fun confirmPasswordReset(@Valid @RequestBody request: PasswordResetConfirmRequest): ResponseEntity<Void> {
        accountRecoveryService.confirmPasswordReset(request)
        return ResponseEntity.noContent()
            .cacheControl(CacheControl.noStore())
            .build()
    }
}
