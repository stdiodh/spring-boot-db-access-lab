package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.dto.PasswordResetMailRequest
import com.andi.rest_crud.recovery.service.AccountRecoveryService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/account-recovery")
class AccountRecoveryController(
    private val accountRecoveryService: AccountRecoveryService
) {

    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun requestPasswordReset(@Valid @RequestBody request: PasswordResetMailRequest) {
        // 계정 존재 여부와 provider 종류를 구분하지 않고 유효한 요청에는 항상 같은 202를 반환합니다.
        accountRecoveryService.requestPasswordReset(request.email)
    }
}
