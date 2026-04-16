package com.andi.rest_crud.dto

data class PostUpdateRequest(
    val title: String,
    val content: String,
    val author: String
)
