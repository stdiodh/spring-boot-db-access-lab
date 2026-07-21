package com.andi.rest_crud.post.exception

class PostNotFoundException(id: Long) : RuntimeException("id=$id 에 해당하는 게시글이 없습니다.")

class ForbiddenPostAccessException(id: Long) : RuntimeException("id=$id 게시글을 수정하거나 삭제할 권한이 없습니다.")
