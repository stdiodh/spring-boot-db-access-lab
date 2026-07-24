package com.andi.rest_crud.user.migration

import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.io.ClassPathResource
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator
import org.springframework.transaction.annotation.Transactional
import javax.sql.DataSource

@SpringBootTest
@Transactional
class LegacyLocalAccountProviderBackfillIntegrationTest @Autowired constructor(
    private val userRepository: UserRepository,
    private val jdbcTemplate: JdbcTemplate,
    private val dataSource: DataSource
) {

    @Test
    fun `provider가 비고 외부 식별자가 없는 기존 계정만 LOCAL로 보정한다`() {
        val legacyLocal = userRepository.saveAndFlush(
            User(
                email = "legacy-local@example.com",
                password = "encoded-password",
                authProvider = "",
                providerId = null
            )
        )
        val google = userRepository.saveAndFlush(
            User(
                email = "google-user@example.com",
                password = "encoded-password",
                authProvider = "GOOGLE",
                providerId = "google-provider-id"
            )
        )
        val ambiguousExternal = userRepository.saveAndFlush(
            User(
                email = "legacy-external@example.com",
                password = "encoded-password",
                authProvider = "",
                providerId = "legacy-provider-id"
            )
        )

        val backfill = ResourceDatabasePopulator(ClassPathResource("data.sql"))
        backfill.execute(dataSource)
        backfill.execute(dataSource)

        assertEquals("LOCAL", authProviderOf(legacyLocal.id))
        assertEquals("GOOGLE", authProviderOf(google.id))
        assertEquals("", authProviderOf(ambiguousExternal.id))
        assertEquals(true, localPasswordEnabledOf(legacyLocal.id))
        assertEquals(false, localPasswordEnabledOf(google.id))
        assertEquals(false, localPasswordEnabledOf(ambiguousExternal.id))
    }

    private fun authProviderOf(userId: Long): String {
        return requireNotNull(
            jdbcTemplate.queryForObject(
                "select auth_provider from users where id = ?",
                String::class.java,
                userId
            )
        )
    }

    private fun localPasswordEnabledOf(userId: Long): Boolean {
        return requireNotNull(
            jdbcTemplate.queryForObject(
                "select local_password_enabled from users where id = ?",
                Boolean::class.java,
                userId
            )
        )
    }
}
