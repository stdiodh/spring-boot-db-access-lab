package com.andi.rest_crud.recovery.exception

class InvalidPasswordResetTokenException :
    RuntimeException("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.")

class RecoveryMailAuthenticationException :
    RuntimeException("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다.")

class RecoveryMailUnavailableException :
    RuntimeException("메일 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.")
