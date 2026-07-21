package com.andi.rest_crud.oauth.exception

class OAuthAccountLinkRequiredException :
    RuntimeException("기존 계정 연결에는 사용자의 명시적인 확인이 필요합니다.")

class OAuthAccountCreationConflictException :
    RuntimeException("OAuth 계정을 만들지 못했습니다. 다시 로그인해 주세요.")

class OAuthProfileRejectedException :
    RuntimeException("검증된 OAuth 사용자 정보가 필요합니다.")
