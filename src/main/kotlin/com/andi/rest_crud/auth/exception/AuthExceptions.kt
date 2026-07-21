package com.andi.rest_crud.auth.exception

class UserAlreadyExistsException : RuntimeException("이미 가입된 이메일입니다.")

class InvalidCredentialsException : RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
