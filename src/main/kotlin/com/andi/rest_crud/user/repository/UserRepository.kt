package com.andi.rest_crud.user.repository

import com.andi.rest_crud.user.domain.User
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
    fun findByAuthProviderAndProviderId(authProvider: String, providerId: String): Optional<User>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from User account where account.email = :email")
    fun findByEmailForUpdate(@Param("email") email: String): Optional<User>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from User account where account.id = :id")
    fun findByIdForUpdate(@Param("id") id: Long): Optional<User>
}
