package com.andi.rest_crud.recovery.exception

class InvalidPasswordResetTokenException :
    RuntimeException("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.")
