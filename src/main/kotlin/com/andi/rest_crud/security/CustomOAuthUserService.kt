package com.andi.rest_crud.security

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

@Service
class CustomOAuthUserService : OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private val delegate = DefaultOAuth2UserService()

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        // TODO 1. 기본 OAuth2UserService로 사용자 정보를 먼저 읽으세요.
        // TODO 2. Google 응답에서 email과 sub(provider id)를 꺼내세요.
        // TODO 3. 우리 쪽에서 쓰기 쉽게 provider/providerId/email 속성을 다시 담으세요.
        TODO("OAuth 사용자 정보 읽기 흐름을 완성하세요.")
    }
}
