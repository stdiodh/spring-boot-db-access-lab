package com.andi.rest_crud.oauth.model

import java.util.Locale

data class OAuthUserProfile(
    val provider: String,
    val providerId: String,
    val email: String,
    val emailVerified: Boolean
) {
    fun normalized(): OAuthUserProfile {
        return copy(
            provider = provider.trim().uppercase(Locale.ROOT),
            providerId = providerId.trim(),
            email = email.trim().lowercase(Locale.ROOT)
        )
    }
}
