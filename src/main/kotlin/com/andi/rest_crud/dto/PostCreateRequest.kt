package com.andi.rest_crud.dto

data class PostCreateRequest(
    val title: String,
    val content: String,
    val author: String
)
