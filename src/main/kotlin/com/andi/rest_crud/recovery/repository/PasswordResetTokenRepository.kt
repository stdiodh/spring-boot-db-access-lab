package com.andi.rest_crud.recovery.repository

import com.andi.rest_crud.recovery.domain.PasswordResetToken
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.Optional

interface PasswordResetTokenRepository : JpaRepository<PasswordResetToken, Long> {
    fun findByTokenHash(tokenHash: String): Optional<PasswordResetToken>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from PasswordResetToken token where token.user.id = :userId")
    fun findByUserIdForUpdate(@Param("userId") userId: Long): Optional<PasswordResetToken>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
        """
        select token from PasswordResetToken token
        where token.tokenHash = :tokenHash
          and token.usedAt is null
          and token.expiresAt > :now
        """
    )
    fun findActiveByTokenHashForUpdate(
        @Param("tokenHash") tokenHash: String,
        @Param("now") now: Instant
    ): Optional<PasswordResetToken>

    // SMTP 실패 보상은 이번 요청의 id·hash·미사용 상태가 모두 맞을 때만 실행해 최신/사용 완료 token을 보호합니다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        delete from PasswordResetToken token
        where token.id = :tokenId
          and token.tokenHash = :tokenHash
          and token.usedAt is null
        """
    )
    fun deleteUnusedByIdAndTokenHash(
        @Param("tokenId") tokenId: Long,
        @Param("tokenHash") tokenHash: String
    ): Int
}
