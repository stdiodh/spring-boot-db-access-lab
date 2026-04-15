package com.andi.rest_crud.dto

import com.andi.rest_crud.model.Idol

data class IdolResponse(
    val id: Long,
    val name: String,
    val group: String,
    val agency: String,
    val debutYear: Int
) {
    companion object {
        fun from(idol: Idol): IdolResponse = IdolResponse(
            id = idol.id,
            name = idol.name,
            group = idol.group,
            agency = idol.agency,
            debutYear = idol.debutYear
        )
    }
}
