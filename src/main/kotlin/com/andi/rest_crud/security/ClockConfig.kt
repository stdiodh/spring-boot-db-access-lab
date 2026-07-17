package com.andi.rest_crud.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock

@Configuration
class ClockConfig {
    @Bean
    fun jwtClock(): Clock = Clock.systemUTC()
}
