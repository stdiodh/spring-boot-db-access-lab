/*
 * 비밀번호 재설정 요청은 token 저장 commit이 끝난 뒤 실제 SMTP 호출을 동기로 기다립니다.
 * SMTP 성공만 200으로 반환하고, 실패하면 이번 요청의 미사용 token을 정리한 뒤 424로 전달합니다.
 */
package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.dto.PasswordResetMailRequest
import com.andi.rest_crud.recovery.dto.PasswordResetMailResponse
import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.mail.PasswordResetMailCommand
import com.andi.rest_crud.recovery.mail.RecoveryMailDeliveryException
import com.andi.rest_crud.recovery.mail.RecoveryMailDispatcher
import com.andi.rest_crud.recovery.service.AccountRecoveryService
import jakarta.validation.Valid
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/account-recovery")
class AccountRecoveryController(
    private val accountRecoveryService: AccountRecoveryService,
    private val recoveryMailDispatcher: RecoveryMailDispatcher
) {

    @PostMapping("/password-reset")
    fun requestPasswordReset(
        @Valid @RequestBody request: PasswordResetMailRequest
    ): ResponseEntity<PasswordResetMailResponse> {
        // service 반환 시 token transaction은 끝났으므로, 발송된 링크가 commit 실패로 무효가 되는 순서를 피합니다.
        val command = accountRecoveryService.requestPasswordReset(request.email)
        dispatchOrDiscard(command)

        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(
                PasswordResetMailResponse(
                    code = "RECOVERY_MAIL_SENT",
                    message = "SMTP 서버가 비밀번호 재설정 메일 요청을 수락했습니다."
                )
            )
    }

    @PostMapping("/password-reset/confirm")
    fun confirmPasswordReset(@Valid @RequestBody request: PasswordResetConfirmRequest): ResponseEntity<Void> {
        accountRecoveryService.confirmPasswordReset(request)
        return ResponseEntity.noContent()
            .cacheControl(CacheControl.noStore())
            .build()
    }

    private fun dispatchOrDiscard(command: PasswordResetMailCommand) {
        try {
            recoveryMailDispatcher.dispatch(command)
        } catch (exception: RecoveryMailAuthenticationException) {
            accountRecoveryService.discardUndeliveredToken(command.tokenId, command.tokenHash)
            throw exception
        } catch (exception: RecoveryMailDeliveryException) {
            accountRecoveryService.discardUndeliveredToken(command.tokenId, command.tokenHash)
            throw exception
        }
    }
}
