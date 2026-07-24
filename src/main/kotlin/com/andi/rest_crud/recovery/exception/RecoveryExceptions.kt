package com.andi.rest_crud.recovery.exception

class InvalidPasswordResetTokenException :
    RuntimeException("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.")

class RecoveryMailNotSentException :
    RuntimeException("비밀번호 재설정 메일을 보낼 수 없는 계정입니다.")

class RecoveryMailCooldownException(
    val retryAfterSeconds: Long
) : RuntimeException("재설정 메일을 이미 요청했습니다. 잠시 후 다시 시도해 주세요.")

class RecoveryMailAuthenticationException(cause: Throwable? = null) :
    RuntimeException("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다.", cause)
