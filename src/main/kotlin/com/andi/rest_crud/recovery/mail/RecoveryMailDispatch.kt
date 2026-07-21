package com.andi.rest_crud.recovery.mail

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

const val RECOVERY_MAIL_EXECUTOR = "recoveryMailExecutor"

class PasswordResetMailRequestedEvent(
    val recipientEmail: String,
    val resetLink: String
) {
    override fun toString(): String {
        return "PasswordResetMailRequestedEvent(recipientEmail=[REDACTED], resetLink=[REDACTED])"
    }
}

@Configuration
@EnableAsync
class RecoveryMailAsyncConfig {

    @Bean(name = [RECOVERY_MAIL_EXECUTOR])
    fun recoveryMailExecutor(): ThreadPoolTaskExecutor {
        return ThreadPoolTaskExecutor().apply {
            corePoolSize = 1
            maxPoolSize = 2
            queueCapacity = 100
            setThreadNamePrefix("recovery-mail-")
            setWaitForTasksToCompleteOnShutdown(true)
            setAwaitTerminationSeconds(10)
            setRejectedExecutionHandler { _, _ ->
                log.warn("Password reset mail dispatch rejected.")
            }
        }
    }

    private companion object {
        val log = LoggerFactory.getLogger(RecoveryMailAsyncConfig::class.java)
    }
}

@Component
class RecoveryMailEventDispatcher(
    private val recoveryMailSender: RecoveryMailSender
) {

    @Async(RECOVERY_MAIL_EXECUTOR)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun dispatch(event: PasswordResetMailRequestedEvent) {
        try {
            recoveryMailSender.sendPasswordResetMail(event.recipientEmail, event.resetLink)
        } catch (_: RuntimeException) {
            log.warn("Password reset mail delivery failed.")
        }
    }

    private companion object {
        val log = LoggerFactory.getLogger(RecoveryMailEventDispatcher::class.java)
    }
}
